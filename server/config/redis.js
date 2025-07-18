
import Redis from "ioredis";
const redis = new Redis();



function connect (){
    redis.on("connect", ()=>{
        console.log("Redis Connected")
    })
    redis.on("error", (err)=>{
        console.log("Redis Error")
    })
}
connect();

export default redis;