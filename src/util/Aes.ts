
// 加密解密
import * as crypto from "crypto";
import * as argon2 from "argon2"

const AES_SECRET_KEY='cac639bd5a423901b984d2b1e1cfb8a9ec4bbf3a4edf2615849da0d42ab378db';

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
     let nonceStr = crypto.randomBytes(64).toString("hex");
     let toStr = getQueryString({nonceStr,jsapi_ticket:AES_SECRET_KEY,timestamp,data})
     console.log("toStr",toStr)
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
    encryption:function(data:string,dataKey:string|Buffer){
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(dataKey, AES_SECRET_KEY, 32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm,key,iv);
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const strIv = iv.toString("hex")
            return encrypted+'::'+strIv;
        } catch (error) {
            return null;   
        }
        
    },
    /**解密
     * 
     * @param afterData 加密后的数据
     * @param dataKey 要生成加密key 的自定义datakey(和加密的一样)
     */
    decrypt:function(afterData:string,dataKey:string){
        try {
            
            const algorithm = 'aes-256-cbc';
            const [value,iv] = afterData.split('::');
            const ivBuffer = Buffer.from(iv,'hex');
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


export async function hashPasswordWithSalt(password) {
    try {
      // 自定义盐值
      const salt = crypto.randomBytes(32);
     console.log("salt",salt.toString("hex"))    
        return await argon2.hash(password, { salt });
    } catch (err) {
      console.error('Error hashing password:', err);
    }
  }

  async function verifyPassword(hash, plainPassword) {
    try {
  
      const match = await argon2.verify(hash, plainPassword);
   
      if (match) {
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }
  

  (async () => {
    const password = 'mySecurePassword';
    let res = await hashPasswordWithSalt(password);
    console.log("Res",res)

    const val = await verifyPassword("$argon2id$v=19$m=65536,t=3,p=4$IkCJqN/C/cJUC63XhgdqwzLDwAE65bhv7FO1Cf8B/2M$/KWPaU4rtK9LrCMv9jOzB8kNpfjbkz3tuJT+B/aEYvk",password)
  
  })();

// const plaintext = 'Hello, World!';
// const encryptedText = encryptWithPublicKey(plaintext);
// const decryptedText = decryptWithPrivateKey("Tds95muJwshCdKvVArndPJoXrU5gTyL0pShK5tmEnLYKrmpK4AN7GlN3PZkHXD+wnPbvGmlBC9jRTvV88aJKN7zT4o9+hrxRUzD5DmAgPCykmU7v4UastQafS907Q7n4BRzIi++hPPz31zwk/USWqp2GxPQaLBqlqDeC2ZqpKLnLyihp48cQeKoClLHRh4o4OA+WMcd3us/lGGIoaj6uMVNh6FjvkYDyHbA/mu0cctrqUNCv6o7V2nlnnS65nXFA+GEvNi7pP7FwSyf5odNxTa5WelLtA2DsYbNeaoC4jTJPqhU1TufgDSheUwLCUe");

// console.log('原数据：Plaintext:', plaintext);
// console.log('加密:Encrypted Text:', encryptedText);
// console.log('解密：Decrypted Text:', decryptedText);

const plaintext1 = AES_SECRET_KEY//'1';
const encryptedText1 = Aes.encryption(plaintext1,'key');
const decryptedText1 = Aes.decrypt(encryptedText1,'key');
console.log('原数据：Plaintext:', plaintext1);
console.log('加密:Encrypted Text:', encryptedText1);
console.log('解密：Decrypted Text:', decryptedText1);

console.log("sha256",sha256("123456"))
console.log("shaHmac",shaHmac("123456"))
console.log("getTokenSign",shaHmac("getTokenSign"))
console.log("getUid",getUid())

// getUid



// // 定义要哈希的密码
// const password = 'mySuperSecretPassword';

// // 生成随机盐
// const salt = crypto.randomBytes(32).toString('hex');

// // 使用 SHA-256 哈希密码并加上盐
// const hash = crypto.createHmac('sha256', salt)
//                    .update(password)
//                    .digest('hex');

// console.log('Salt:', salt);
// console.log('Hashed password:', hash);

// // 验证密码时，使用同样的盐进行哈希
// function verifyPassword(inputPassword, storedHash, salt) {
//     const hashToCompare = crypto.createHmac('sha256', salt)
//                                 .update(inputPassword)
//                                 .digest('hex');
//     return hashToCompare === storedHash;
// }

// // 示例：验证密码
// console.log('Password match:', verifyPassword('mySuperSecretPassword', hash, salt)); // true