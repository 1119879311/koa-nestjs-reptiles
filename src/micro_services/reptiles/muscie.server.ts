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
import cheerio from "cheerio"; // 这是一个在node端的jquery
import url from "url";
import { Logger } from "@bylive/nestjs";
import path from "path";

// 爬音乐的

export class MuscieServer {
  private asyncPriorityQueue: AsyncPriorityQueue;
  private downMusicQueue: AsyncPriorityQueue;
  private downRetryMap: Map<string, number>;
  private HOST:string = "music.2t58.com"
  private hostUrl: string = encodeChineseInURL("http://music.2t58.com");
  private songTotal: number = 0;

  private songList: any[] = [];

  private retryCount: number = 1; // 重错次数

  constructor() {
    this.asyncPriorityQueue = new AsyncPriorityQueue(5, 500);
    this.downMusicQueue = new AsyncPriorityQueue(5);
    this.downRetryMap = new Map();
  }
  public async init(keywork: string) {
    if (!keywork) {
      return { success: false, message: "参数keyword不能为空" };
    }
    let resData = (await this.loopList(keywork)) as any[];
    console.log("resdata", resData);
    return { success: true, message: "获取成功", result: resData };
  }


  /**
   * 监听任务
   */
  listenTask = (keywork:string,resolve)=>{
    let reslist = [];
    let timer = null;
    this.asyncPriorityQueue.onTaskRun( async ({id,data,success})=>{
      clearInterval(timer)
      if(success){
        let response = data;
        if (!response.url) {
          Logger.error(`<listenTask.onTaskRun.SUCCESS.NoULR>:${response.url}`);
          return;
        }
        if (response.title) {
          response.title = sanitizeFileName(response.title || "") || "";
        }
        reslist.push(response);
        Logger.info(response.url);
        this.downMusicQueue.addTask(() => this.downloadFile(response)); // 开启队列下载 
      }else{
        Logger.error(`<listenTask.onTaskRun.Error.reqParams>:\n${JSON.stringify(data?.reqParams||{},null,2)}`)
        Logger.error("<listenTask.onTaskRun.Error.message>:" + data.error);
      }
      timer = setTimeout(()=>{
        // 完成
        if(this.asyncPriorityQueue.isFinsh()){
          Logger.info("音频链接数据全部获取完成");
          let tottals = this.downMusicQueue.getQueueSize()
          if(this.downMusicQueue.getQueueSize()){
            Logger.info(`音频待下载数：${tottals}`);
          }
          resolve(reslist)
          writeJsonToFile(
              reslist,
              mkResolveRoot("public", "theme", "songe", `${keywork}.json`)
          );
        }
      },1000)

    })

    let downTimer = null;
    this.downMusicQueue.onTaskRun(()=>{
       clearTimeout(downTimer)
       downTimer = setTimeout(()=>{
        if(this.asyncPriorityQueue.isFinsh()){
          console.log("音频文件全部下载完成")
        }
       },1000)
     
    })

  }

  /**
   * 列表
   * @param keywork
   * @returns
   */
  private async loopList(keywork: string) {
    return new Promise(async (resolve) => {
      
      // 保证取得第一个的数据，剩下的交给队列处理
      this.listenTask(keywork, resolve)
      let resData = await this.handleResponeData(keywork);
      if(resData.success){
        this.songList = [...this.songList, ...resData.data];
      }else{  
        resolve( [])
      }
      for (let i = 2; i <= this.songTotal; i++) {
        let resData = await this.handleResponeData(keywork, i);
        this.songList = [...this.songList, ...resData.data];
      }



    });
  }

  // 下载音频的
  private downloadFile(response) {
    const fileName = this.getPathFileName(response.url)
    downloadFile(
      encodeChineseInURL(response.url),
      mkResolveRoot(
        "public",
        "upload",
        "music",
        `${response.title}_${fileName}`
      )
    )
      .then((res) => {
        Logger.info(
          `资源下载成功,还剩下${this.downMusicQueue.getQueueSize()}个任务,【${
            response.url
          }】`
        );
        if(this.downRetryMap.has(fileName)){
          this.downRetryMap.delete(fileName);
        }
      })
      .catch((err) => {
        if(this.retryCount<1){
          Logger.error(
            `下载失败:"[${response.url}]:${err?.message}`
          );
          return
        }
        let rescont = this.downRetryMap.get(fileName) || 0;
        if (rescont > this.retryCount) {
          // Logger.error(err);
          Logger.error(
            `下载失败，重试次数已达${this.retryCount}次:${response.url}`
          );
          this.downRetryMap.delete(fileName);
        } else {
          this.downRetryMap.set(fileName, rescont + 1);
          Logger.error(
            `下载失败，正在尝试重新下载:"[${response.url}]:${err?.message}`
          );
          this.downMusicQueue.addTask(() => this.downloadFile(response));
        }
      });
  }

  /**
   * 处理列表数据
   * @param keywork
   * @param page
   * @returns
   */
  private async handleResponeData(keywork: string, page: number = 1) {
    try {
      let resData = await this.getFetchSongListData(keywork, page);
     
      if (!resData) {
        return { success: false, message: "获取失败，请稍后重试", data: [] };
      }
      let $ = cheerio.load(resData.data);
      let totats = Number($(".pagedata span").text());
      if (totats < 1 || isNaN(totats)) {
        return { success: false, message: "获取成功，暂无数据", data: [] };
      }
      let listEle = $(".play_list ul li");
      // 获取总列表数据
      if (this.songTotal <= 1) {
        let pageCounts = Math.floor(totats / listEle.length); // 真是存在有多页数据
        if (pageCounts > 1) {
          let songTotal = Number(
            this.getPathNameLastParam($(".page a").last().attr("href"))
          );
          if (!isNaN(songTotal)) {
            this.songTotal = songTotal;
          }
        }
      }

      let result = [];

      listEle.each((index, ele) => {
        let $ele = $(ele);
        let id = this.getPathNameLastParam(
          $ele.find(".list_r .name .url").attr("href")
        );
        let songer = $ele.find(".list_r p font").text();
        let songName = $ele.find(".list_r .name a").text();
        let item = { songer, songName, id };
        this.asyncPriorityQueue.addTask(() => this.getSongInfo(id));
        result.push(item);
      });
     
      return { success: true, message: "获取成功", data: result };
    } catch (error) {

      Logger.error(`handleResponeData=>${error.message}:${error.stack}`);

      return { success: false, message: "获取失败", data: [] };
    }
  }

  private async getFetchSongListData(keywork: string, page: number = 1) {
    const url = encodeChineseInURL(`${this.hostUrl}/so/${keywork}/${page}.html`)
    try {

      return await axios.get(url, {
        headers: {
          ...getRequestHeaders(),
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
          "cache-control": "max-age=0",
          "Accept-Encoding": "gzip, deflate",
          "Connection": "keep-alive",
          "upgrade-insecure-requests": "1",
          "cookie": "mode=1; songIndex=0; coin_screen=1536*864; HMACCOUNT=C52FADC89D150167; Hm_lvt_bd31c6b2a86826db4d130567b8f44fdb=1725176975; Hm_lpvt_bd31c6b2a86826db4d130567b8f44fdb=1725628269",
          "Referer": this.hostUrl,
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
      });
    } catch (error) {
      Logger.error(`[getFetchSongListData.ERROR]=>${url}\n${error.message}`);
    }
  }

  private async getSongInfo(id: string, type: string = "song") {
    const reqParams = {url:encodeChineseInURL("http://www.wxmp3.com/style/js/play.php"),id,type};
    return axios
      .post(reqParams.url, `id=${reqParams.id}&type=music`, {
        headers: {
          ...getRequestHeaders(),
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Accept-Encoding": "gzip, deflate",
          "Accept-Language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
          "Connection": "keep-alive",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Cookie": "mode=1; songIndex=0; coin_screen=1536*864; HMACCOUNT=C52FADC89D150167; Hm_lvt_bd31c6b2a86826db4d130567b8f44fdb=1725176975; Hm_lpvt_bd31c6b2a86826db4d130567b8f44fdb=1725630794",
          "Host": this.HOST,
          "Origin":this.hostUrl,
          "Referer": encodeChineseInURL(`${this.hostUrl}${type}/${id}.html`), //"http://www.wxmp3.com/song/aGdzc21tZmw.html",
          "Referrer-Policy": "strict-origin-when-cross-origin",
         " X-Requested-With": "XMLHttpRequest"
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        return Promise.reject({
          code: -100,
          reqParams,
          message: "获取失败",
          error: error?.message,
        });
      });
  }

  /**
   * // 获取地址最后一个pathName 除了后缀的地址 如 /a/b/2.html => 2
   * @param urlStr
   * @returns
   */
  private getPathNameLastParam(urlStr: string) {
    const fileName = this.getPathFileName(urlStr)
    const id = fileName.replace(path.extname(fileName)||'','')
    return id;
  }

  private getPathFileName(urlstr:string){
   return  url.parse(urlstr).pathname.split("/").pop()
  }
}
