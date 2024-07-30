
// 加密解密
import * as crypto from "crypto";

const AES_SECRET_KEY='AES_SECRET_KEY';


const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  
  /**
   *  非对称加密
   * @param text 
   * @returns 
   */
 export function encryptWithPublicKey(text) {
    const encryptedBuffer = crypto.publicEncrypt(publicKey, Buffer.from(text));
    return encryptedBuffer.toString('base64');
  }
  
  /**
   * 非对称解密
   * @param encryptedText 
   * @returns 
   */
 export function decryptWithPrivateKey(encryptedText) {
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    const decryptedBuffer = crypto.privateDecrypt(privateKey, encryptedBuffer);
    return decryptedBuffer.toString();
  }

  const plaintext = 'Hello, World!';
  const encryptedText = encryptWithPublicKey(plaintext);
  const decryptedText = decryptWithPrivateKey(encryptedText);
  
  console.log('原数据：Plaintext:', plaintext);
  console.log('加密:Encrypted Text:', encryptedText);
  console.log('解密：Decrypted Text:', decryptedText);

// 生成时间戳
export const getTimestamp = ()=>{
    return new Date().getTime()
}

export const getUid = ()=>{
    return ([8,4,4,4,12].map(signRonder)).join("-").toLowerCase()
}


//按照字段名的ASCII 码从小到大排序
export function getQueryString <T extends object>(data:T):string{
    let keys = Object.keys(data)
    let newKeys = keys.sort()
    let singArr:Array<string> = []
    for(let i =0;i<newKeys.length;i++){
        let dataKey= newKeys[i] as any
        singArr.push(dataKey+'='+data[dataKey])
    }
    let sinStr =singArr.join("&")

    return sinStr

}
/**
 * sha1 加密
 * @param str 
 * @param encodeing 
 */
export const sha256= (str:string,encodeing:crypto.Encoding='utf-8')=>{
    return crypto.createHash("sha256").update(str,encodeing).digest('hex');
}
export const getTokenSign = (data:string)=>{
     const timestamp = getTimestamp();
     const nonceStr  = getUid();
     let toStr = getQueryString({nonceStr,jsapi_ticket:AES_SECRET_KEY,timestamp,data})
     return sha256(toStr)
}


/**
 * 生成随机数据
 * @param n 
 * @returns 
 */
export function signRonder(n = 30){ //取随机数
    var str = "123456789aAbBcCdDeEfFgGhHiIjJkKlLmMoOpPqQurRsStTuUvVwWxXyYzZ";
    if ( n < 3) n = 30;
    var ronderstr = "";
    for (var i = 0; i < n; i++) {
        var index = Math.floor(Math.random() * str.length);
        ronderstr += str[index];
    }
    return ronderstr
}

/**
 * md5 加密
 * @param str 
 * @param encodeing 
 */
export const md5 = (str:string,encodeing:crypto.Encoding='utf-8')=>{
    return crypto.createHash('md5').update(str, encodeing).digest('hex')
}


/**
 * 使用 HMAC-SHA1 算法生成带有自定义 key 的哈希值
 * @param data 
 * @param key 
 * @returns 
 */
export const shaHmac =(data:string,key?:string)=>{
    let dataKey = key || data.split('').reverse().join('');
    let hash = crypto.createHmac("sha256",dataKey)
    hash.update(data);
    return hash.digest("hex");
}

export const Aes = {
    /**加密
     * 
     * @param dataKey 要生成加密key 的自定义datakey(解密的时候需要)
     */
    encryption:function(data:string|number,dataKey:string|number){
        try {
            data = typeof data!=="string"?data.toString():data;
            dataKey = typeof dataKey!=="string"?dataKey.toString():dataKey;
            let algorithm = 'aes-256-ctr';
            let key = crypto.scryptSync(dataKey, AES_SECRET_KEY, 32);
            let iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm,key,iv);
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            let strIv = iv.toString("hex")
            return encrypted+'.'+strIv;
        } catch (error) {
            return null;   
        }
        
    },
    /**解密
     * 
     * @param afterData 加密后的数据
     * @param dataKey 要生成加密key 的自定义datakey(和加密的一样)
     */
    decrypt:function(afterData:string,dataKey:string|number){
        try {
            dataKey = typeof dataKey!="string"?dataKey.toString():dataKey;
            let algorithm = 'aes-256-ctr';
            let [value,iv] = afterData.split('.');
            let ivBuffer = Buffer.from(iv,'hex');
            let key = crypto.scryptSync(dataKey, AES_SECRET_KEY, 32);
            const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
            let decrypted = decipher.update(value, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted
        } catch (error) {
            
            return null;   
        }
    }
}