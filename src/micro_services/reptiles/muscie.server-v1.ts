import { getRequestHeaders } from "../../util/requestHeaders";
import { AsyncPriorityQueue } from "../../util/AsyncQueue";
import { downloadFile } from "../../util/downloadFile";
import {
  mkResolveRoot,
  writeJsonToFile,
  sanitizeFileName,
  encodeChineseInURL,
} from "../../util";
import axios from "axios";
import url from "url";
import { Logger } from "@bylive/nestjs";
import path from "path";

// 爬音乐的

export class MuscieServerV1 {
  private asyncPriorityQueue: AsyncPriorityQueue;
  private downMusicQueue: AsyncPriorityQueue;
  private downRetryMap: Map<string, number>;
  private hostUrl: string = encodeChineseInURL("https://music.rm123.cn");
  private songList: any[] = [];

  private retryCount: number = 10; // 重错次数

  constructor() {
    // this.asyncPriorityQueue = new AsyncPriorityQueue(5, 500);
    this.downMusicQueue = new AsyncPriorityQueue(20,500);
    this.downRetryMap = new Map();
  }
  public async init(keywork: string) {
    if (!keywork) {
      return { success: false, message: "参数keyword不能为空" };
    }
    let resData = (await this.loopList(encodeChineseInURL(keywork), 1)) as any[];
    console.log("resdata", resData);
    return { success: true, message: "获取成功", result: resData };
  }

  /**
   * 监听任务
   */
  listenTask = () => {
    let downTimer = null;
    this.downMusicQueue.onTaskRun(() => {
      clearTimeout(downTimer);
      downTimer = setTimeout(() => {
        if (this.downMusicQueue.isFinsh()) {
          clearTimeout(downTimer);
          Logger.info(`<listenTask>,音频文件全部下载完成`);
        }
      }, 10000);
    });
  };

  /**
   * 列表
   * @param keywork
   * @returns
   */
  private async loopList(keywork: string, page: number) {
    try {
      this.listenTask();
      let list = await this.getFetchSongList(keywork, page);
      this.loopDownList(list);
      this.songList = [...this.songList, ...list];
      this.loopList(keywork, page + 1);
    } catch (error) {
      writeJsonToFile(
        this.songList,
        mkResolveRoot("public", "theme", "songe", `${decodeURIComponent(keywork)}.json`)
      );
    }
    return this.songList;
  }

  private async loopDownList(data: any[]) {
    for (let index = 0; index < data.length; index++) {
      this.downMusicQueue.addTask(() => this.downloadFile(data[index]));
    }
  }

  getFetchSongList(keywork: string, page: number = 1) {
    const fetchUrl = `https://music.rm123.cn/`;
    const reqParams = { input: keywork, filter: "name", type: "netease", page };
    return axios
      .post(fetchUrl, `input=${keywork}&filter=name&type=netease&page=${page}`, {
        headers: {
           ...getRequestHeaders(),
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "referrer":`${this.hostUrl}/?name=${keywork}&type=netease`,
          // "referrer": "https://music.rm123.cn/?name=%E5%BC%A0%E6%95%AC%E8%BD%A9&type=netease",
          "referrerPolicy": "strict-origin-when-cross-origin",
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
          "x-requested-with": "XMLHttpRequest",
          "mode": "cors",
          "credentials": "include",
          // "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie:"__51vcke__KPo9GmvBAbtC0w9j=463abd08-838e-5ebf-a4cc-0e50e729d150; __51vuft__KPo9GmvBAbtC0w9j=1725697574790; __vtins__KPo9GmvBAbtC0w9j=%7B%22sid%22%3A%20%22f141cfde-676f-5d20-9d15-b07a8854f799%22%2C%20%22vd%22%3A%201%2C%20%22stt%22%3A%200%2C%20%22dr%22%3A%200%2C%20%22expires%22%3A%201725703590396%2C%20%22ct%22%3A%201725701790396%7D; __51uvsct__KPo9GmvBAbtC0w9j=2",
      },
      })
      .then((res) => {
        const data = res.data;
        Logger.info(`【${fetchUrl}】,<getFetchSongList.FETCH.SUCCESS>,获取成功`)
        if (data && Array.isArray(data.data)) {
          return data.data;
        }
        Logger.error(`【${fetchUrl}】,<getFetchSongList.FETCH.ERROR>,没有数据`)
        return Promise.reject({
          error: data.error,
          code: data.code,
          data: [],
          succes: false,
        });
      })
      .catch((error) => {

        Logger.error(`【${fetchUrl}】,<getFetchSongList.FETCH.ERROR>,获取失败,正在尝试重新获取`)
        // Logger.error(`[getFetchSongList.FETCH.ERROR]:${fetchUrl}:获取失败`)

        return Promise.reject({
          succes: false,
          data: [],
          code: -100,
          reqParams,
          error: error?.message,
        });
      });
  }

  // 下载音频的
  private downloadFile(response) {
    const fileName = this.getQuery(response.url, "id");
    const outName = this.removeIllegalChart(`${response.title}_${fileName}`)
    downloadFile(
      encodeChineseInURL(response.url),
      mkResolveRoot(
        "public",
        "upload",
        "music",
        outName
      ),
      {
        headers: {
          accept: "*/*",
          "accept-encoding": "identity;q=1, *;q=0",
          "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
          priority: "i",
          referer: "https://music.rm123.cn/",
          "sec-ch-ua":
            '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "Windows",
          "sec-fetch-dest": "audio",
          "sec-fetch-mode": "no-cors",
          "sec-fetch-site": "cross-site",
        },
      }
    )
      .then((res) => {
        Logger.info(
          `【${response.url}】,资源下载成功,还剩下${this.downMusicQueue.getQueueSize()}个任务`
        );
        if (this.downRetryMap.has(fileName)) {
          this.downRetryMap.delete(fileName);
        }
      })
      .catch((err) => {
        if (this.retryCount < 1) {
          Logger.error(`【${response.url},${err?.message},下载失败`);
          return;
        }
        let rescont = this.downRetryMap.get(fileName) || 0;
        if (rescont > this.retryCount) {
          // Logger.error(err);
          Logger.error(
            `【${response.url}】,下载失败，重试次数已达${this.retryCount}次`
          );
          this.downRetryMap.delete(fileName);
        } else {
          this.downRetryMap.set(fileName, rescont + 1);
          Logger.error(
            `[${response.url}],${err?.message},下载失败，正在尝试重新下载,重试次数:${rescont}`
          );
          this.downMusicQueue.addTask(() => this.downloadFile(response));
        }
      });
  }

  getQuery(urls, key?: string) {
    let resData = url
      .parse(urls)
      .query?.split("&")
      ?.reduce((res, item) => {
        let list = item.split("=");
        res[list[0]] = list[1];
        return res;
      }, {});

    return key != undefined ? (resData[key] ) : resData;
  }

  removeIllegalChart(str){
    return (str || "").replace(/\s|\+|\?|\||"|,|\\|\/|\||\%|\&|\*/g,'')
  }
}
