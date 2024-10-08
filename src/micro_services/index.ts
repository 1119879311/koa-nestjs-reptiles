import {MuscieServer} from "./reptiles/muscie.server"
import axios from "axios";
import {
  
    encodeChineseInURL,
    mkResolveRoot,
  } from "../util";
  import url from "url";
  import path from "path";
import { downloadFile } from "../util/downloadFile";
import { MuscieServerV1 } from "./reptiles/muscie.server-v1";
function start(){
//  const muscieServerIns =  new MuscieServer();
//  muscieServerIns.init(encodeChineseInURL("周传雄"))
   const v1 = new MuscieServerV1()
   v1.init(encodeChineseInURL("周杰伦"))
}
start()
// console.log(url.parse("http://music.163.com/song/media/outer/url?id=29897965.mp3").query?.split("&")?.reduce((res,item)=>{
//   let list =item.split("=")
//    res[list[0]] = list[1]
//    return res
// },{}))
// axios.get(encodeChineseInURL("https://music.163.com/song/media/outer/url?id=189181.mp3"), {
//     // responseType:"blob",
//     responseType: 'stream',
//     "headers": {
//       // ":authority":"music.163.com",
//       // ":path:":"song/media/outer/url?id=189181.mp3",
//       // ":scheme":"https",
//       "accept": "*/*",
//       "accept-encoding":"identity;q=1, *;q=0",
//       "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
//       "priority":"i",
//       "referer":"https://music.rm123.cn/",
//       "sec-ch-ua":'"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
//       "sec-ch-ua-mobile":"?0",
//       "sec-ch-ua-platform":"Windows",
//       "sec-fetch-dest":"audio",
//       "sec-fetch-mode":"no-cors",
//       "sec-fetch-site":"cross-site",
//       "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
//       // "Referrer-Policy": "strict-origin-when-cross-origin"
//     },
//     // "body": null,
//     // "method": "GET"
//   }).then( async res=>{
//     console.log("res", await res.headers,res.headers["Content-Type"])
//     const fileName = decodeURIComponent(res.headers['content-disposition']?.split(";")[1]?.split("=")?.[1]||"");
//     console.log(fileName,)
//   });

// axios.post("https://music.rm123.cn/","input=%E5%BC%A0%E6%95%AC%E8%BD%A9&filter=name&type=netease&page=11", {
//     "headers": {
//       "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//       "referrer": "https://music.rm123.cn/?name=%E5%BC%A0%E6%95%AC%E8%BD%A9&type=netease",
//       "referrerPolicy": "strict-origin-when-cross-origin",
//       "accept": "application/json, text/javascript, */*; q=0.01",
//       "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
//       "x-requested-with": "XMLHttpRequest",
//       "mode": "cors",
//       "credentials": "include"
//     },
   
//   }).then( async res=>{
//     console.log("res", await res.data)
//   });
// http://m10.music.126.net/20240907142137/e12df319dc683f404d98c7951371991e/ymusic/obj/w5zDlMODwrDDiGjCn8Ky/3049642547/4727/71e2/ddc0/3643217eb5d15a37e7e98d1f1baa072d.mp3
// downloadFile("https://m10.music.126.net/20240907141144/45d3dbefa3091da2154e94bc19f53a19/ymusic/obj/w5zDlMODwrDDiGjCn8Ky/3049642547/4727/71e2/ddc0/3643217eb5d15a37e7e98d1f1baa072d.mp3",
// mkResolveRoot(
//     "public",
//     "upload",
//     "music",
//     `29897953.mp3`
//   )
// ).then(res=>{
//   console.log("下载成功")
// }).catch(err=>{
//   console.log("下载失败",err)

// })

// downloadFile(encodeChineseInURL("https://music.163.com/song/media/outer/url?id=189181.mp3"),
//  mkResolveRoot(
//       "public",
//       "upload",
//       "music",
//       `1891812222.mp3`
//     ),
//    {
//     // responseType:"blob",
//     // responseType: 'stream',
//     "headers": {
     
//       "accept": "*/*",
//       "accept-encoding":"identity;q=1, *;q=0",
//       "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6",
//       "priority":"i",
//       "referer":"https://music.rm123.cn/",
//       "sec-ch-ua":'"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
//       "sec-ch-ua-mobile":"?0",
//       "sec-ch-ua-platform":"Windows",
//       "sec-fetch-dest":"audio",
//       "sec-fetch-mode":"no-cors",
//       "sec-fetch-site":"cross-site",
//       "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
//       // "Referrer-Policy": "strict-origin-when-cross-origin"
//     },
//     // "body": null,
//     // "method": "GET"
//   }).then( async res=>{
//     console.log("下载成功")
//     // console.log("res", await res.headers,res.headers["Content-Type"])
//     // const fileName = decodeURIComponent(res.headers['content-disposition']?.split(";")[1]?.split("=")?.[1]||"");
//     // console.log(fileName,)
//   }).catch(err=>{
//     console.log("下载失败",err)
//   });

// {
  // https://m10.music.126.net/20240907142705/281c3700ac56171e9b302c3bbde3a097/ymusic/obj/w5zDlMODwrDDiGjCn8Ky/3049642547/4727/71e2/ddc0/3643217eb5d15a37e7e98d1f1baa072d.mp3
//   "type": "netease",
//   "link": "http://music.163.com/#/song?id=189181",
//   "songid": 189181,
//   "title": "笑忘书",
//   "author": "张敬轩",
//   "lrc": "[00:00.00] 作词 : 林若宁\n[00:01.00] 作曲 : 张敬轩\n[00:02.00] 编曲 : 冯翰铭THE INVISIBLE MEN\n[00:03.00] 制作人 : 冯翰铭\n[00:24.44]要 背负个包袱 再 跳落大峡谷\n[00:37.40]烦恼 用个大网将你捕捉\n[00:43.90]还是你 抛不开拘束\n[00:50.86]你 昨夜发的梦 到 这夜已告终\n[01:03.97]沉下去 头上散落雨点没有彩虹\n[01:11.18]你 还在抱着记忆 就似块石头很重\n[01:23.59]得到同样快乐 彼此亦有沮丧\n[01:30.19]童话书从成长中 难免要学会失望\n[01:36.85]经过同样上落 彼此堕进灰网\n[01:43.78]沉溺 烦扰 磨折 何苦 多讲\n[01:57.59]我 快乐到孤独 我 缺乏到满足\n[02:10.70]游戏 就算愉快不会幸福\n[02:17.36]人大了 开心都想哭\n[02:24.56]我 每日要生活 我 每日要斗苦\n[02:37.32]捱下去 连上帝亦也许没法搀扶\n[02:44.13]我 前路有右与左 面对抉择难兼顾\n[02:56.53]得到同样快乐 彼此亦有沮丧\n[03:03.49]童话书从成长中 难免要学会失望\n[03:10.09]经过同样上落 彼此堕进灰网\n[03:16.84]沉溺 烦扰 磨折 何苦 多讲\n[03:26.75]拥有同样寄望 彼此亦有苦况\n[03:33.61]棉花糖从成长中 曾送你愉快天堂\n[03:40.16]经过同样跌荡 可会学会释放\n[03:46.87]童话 情书 遗书 寻找 答案\n[04:00.23]曾经...曾经...回忆当天三岁的波板糖\n[04:30.67]监制 : 冯翰铭＠The Invisible Men\n",
//   "url": "http://music.163.com/song/media/outer/url?id=189181.mp3",
//   "pic": "http://p1.music.126.net/G7r5kkRJb1Fc9cRS2wFjPQ==/109951165230277715.jpg?param=300x300"
// }
// https://lv-sycdn.kuwo.cn/1120c4e3996c770b5d8ef5058d524923/66db11e4/resource/30106/trackmedia/M800004P0WSD0TUBeQ.mp3?from=bodia

// const urls = "https://lw-sycdn.kuwo.cn/d5521626c57230a26fd7799909e79f2f/66db099d/resource/30106/trackmedia/M800001e7iIy2zoELU.mp3?from=bodian"
// let list = url.parse(urls).pathname.split("/").pop();
// console.log( list,path.extname(list),list.replace(path.extname(list)||'',''))