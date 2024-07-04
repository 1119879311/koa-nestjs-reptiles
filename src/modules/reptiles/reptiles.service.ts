import { getRequestHeaders } from "../../util/requestHeaders";
import { AsyncPriorityQueue } from "../../util/AsyncQueue";
import {downloadFile} from "../../util/downloadFile"
import { mkResolveRoot  ,getUrlExtension,writeJsonToFile,sanitizeFileName} from '../../util';
import { Injectable } from '@bylive/ioc';
import axios from 'axios';
import cheerio from "cheerio" // 这是一个在node端的jquery
import url from "url"
import path from "path";
import { Logger } from "@bylive/nestjs";
// downloadFile("https://lo-sycdn.kuwo.cn/5e69b5fbadb6608a3b525dd976685dc7/6682c3fd/resource/n1/22/65/1821392426.mp3",
//   resolveApp(path.join("public","upload","侧田.mp3"))
// ).then(res=>{
//   console.log("下载成功")
// }).catch(err=>{
//   console.log("下载失败",err)

// })
// 爬音乐的
@Injectable()
export class MuscieServer {
  private asyncPriorityQueue:AsyncPriorityQueue
  private downMusicQueue:AsyncPriorityQueue
  private downRetryMap:Map<number,number>

  private hostUrl:string="http://www.wxmp3.com/"
  private songTotal:number=0;



  private songList:any[] = []

  constructor() {
    this.asyncPriorityQueue = new AsyncPriorityQueue(20,500);
    this.downMusicQueue = new AsyncPriorityQueue(20)
    this.downRetryMap = new Map()
  }
  public async init(keywork:string) {
    if(!keywork){
        return {success:false,message:"参数keyword不能为空"}
    }
    let resData = await this.loopList(keywork) as any[]
    console.log("resdata",resData.length)
    return  {success:true,message:"获取成功",result:resData }
  }


  /**
   * 列表
   * @param keywork 
   * @returns 
   */
  private async loopList(keywork:string){
   
    // 保证取得第一个的数据，剩下的交给队列处理
    let resData = await this.handleResponeData(keywork)
   
    this.songList=[...this.songList,...resData.data]
    for(let i=2;i<=this.songTotal;i++){
      // this.asyncPriorityQueue.addTask(()=>this.handleResponeData(keywork,i))
      let resData = await this.handleResponeData(keywork,i)
      this.songList=[...this.songList,...resData.data]
    }
    this.downMusicQueue.onTaskFinsh(()=>{
      console.log("音乐全部下载完成",this.downMusicQueue.runningTasks.size,this.downMusicQueue.taskQueue.length)
    })
    let reslist = []

    this.asyncPriorityQueue.onTaskRun((result)=>{
      let response = result.data;
      if(!response.wmid){
        Logger.error(JSON.stringify(response))
        return
      }
      reslist.push(response);
      Logger.info(response.url)
      this.downMusicQueue.addTask(()=>this.downloadFile(response));// 开启队列下载
      if(this.asyncPriorityQueue.isFinsh()){
        
        writeJsonToFile(reslist,
          mkResolveRoot( "public","theme",'songe',`${keywork}.json`)
        )
        
      }
    },(error)=>{
      Logger.error("正在重新获取:"+error.id);
      
      this.asyncPriorityQueue.addTask(()=>this.getSongInfo(error.id))
    })
    return new Promise(resolve=>{
        this.asyncPriorityQueue.onTaskFinsh(()=>{
            console.log("全部下载成功")
            writeJsonToFile(reslist,
              mkResolveRoot( "public","theme",'songe',`${keywork}.json`)
              
              // resolveRoot(path.join("public","theme",'songe', `${keywork}.json`))
            )
            resolve(reslist)
        })

          
      })
    
  }


  // 下载
  private downloadFile(response){
    downloadFile(response.url,
       mkResolveRoot("public","upload",'music',`${sanitizeFileName(response.title)}_${response.wmid}.${getUrlExtension(response.url)}`)
      // resolveRoot(path.join("public","upload",'music', `${sanitizeFileName(response.title)}_${response.wmid}.${getUrlExtension(response.url)}`))
    ).then(res=>{
      console.log(`资源下载成功,还剩下${this.downMusicQueue.getQueueSize()}个任务,【${response.url}】`)
      this.downRetryMap.delete(response.wmid)

    }).catch(err=>{
     
      let rescont = this.downRetryMap.get(response.wmid) || 0
      if(rescont>10){
          Logger.error(err)
          Logger.error("下载失败，重试次数已达10次:"+response.url)
          
      }else{
        this.downRetryMap.set(response.wmid,rescont+1)
        Logger.error(`下载失败，正在尝试重新下载:"[${response.url}]:${err?.message}`)
        this.downMusicQueue.addTask(()=>this.downloadFile(response))
      }
     
      
    })
  }

  private async handleResponeData(keywork:string,page:number=1){

    let resData = await this.getFetchSongListData(keywork,page)
    if(!resData){
        return {success:false,message:"获取失败，请稍后重试",data:[]}
    }
    let $ = cheerio.load(resData.data);
    let totats = Number($(".pagedata span").text());
    if(totats<1 || isNaN(totats)){
      return {success:false,message:"获取成功，暂无数据",data:[]}
    }
    let listEle = $(".play_list ul li");
    // 获取总列表数据
    if(this.songTotal<=1){
      let pageCounts = Math.floor(totats/listEle.length);// 真是存在有多页数据
      if(pageCounts>1){
        let songTotal = Number(this.getPathNameLastParam($(".page a").last().attr("href")));
        if(!isNaN(songTotal)){
          this.songTotal = songTotal;
        }
      }
    }
   
    let result = [];
    
    listEle.each((index,ele) => {
        let $ele = $(ele);
        let id = this.getPathNameLastParam($ele.find(".list_r .name .url").attr("href"))
        let songer = $ele.find(".list_r p font").text()
        let songName = $ele.find(".list_r .name a").text()
        let item = {songer,songName,id}
        this.asyncPriorityQueue.addTask(()=>this.getSongInfo(id))
        result.push(item)
    })
    // console.log("result",result)
    return {success:true,message:"获取成功",data:result}
    // let alllist = await Promise.all(result.map(async item=> await this.getSongInfo(item.id)))

  }

 

 private async getFetchSongListData(keywork:string,page:number=1){
     try {
      return  axios
        .get(
          `${this.hostUrl}so/song/${keywork}/${page}.html`,
          {
            headers: {
              ...getRequestHeaders(),
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
              "cache-control": "max-age=0",
              "upgrade-insecure-requests": "1",
              "cookie": "Hm_lvt_bd31c6b2a86826db4d130567b8f44fdb=1719585869; Hm_lpvt_bd31c6b2a86826db4d130567b8f44fdb=1719586758",
              "Referer": this.hostUrl,
              "Referrer-Policy": "strict-origin-when-cross-origin"
            },
          }
        )
        
     } catch (error) {
        throw new Error(error.message || "远程服务异常,获取失败");
        // return null 
     }
 }

 private async getSongInfo(id:string,type:string="song"){

   return axios.post("http://www.wxmp3.com/style/js/play.php",`id=${id}&type=music`, {
        "headers": {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
          "cookie": "Hm_lvt_bd31c6b2a86826db4d130567b8f44fdb=1719585869; Hm_lpvt_bd31c6b2a86826db4d130567b8f44fdb=1719586864",
          "Referer": `${this.hostUrl}${type}/${id}.html` ,//"http://www.wxmp3.com/song/aGdzc21tZmw.html",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
      }).then(res=>res.data)
      .catch(error=>{
      
        return Promise.reject({code:-100,message:"获取失败",error:error?.message})
      })
 }

   /**
   * // 获取地址最后一个pathName 除了后缀的地址 如 /a/b/2.html => 2
   * @param urlStr 
   * @returns 
   */
   private getPathNameLastParam(urlStr:string){
    let list =  url.parse(urlStr).pathname.split("/");
    let id = list[list.length-1].replace(".html",'')
    return id
 }
}
