const Promise = require("bluebird");

const redisClient = Promise.promisifyAll(
    require('redis')
        .createClient(
            process.env.REDIS_PORT,
            process.env.REDIS_HOST
        )
);


const logRequest = async (ip, currTime) => {
    await redisClient.setAsync(ip, currTime);
}

const enqueue = (url) => {
    redisClient.rpush(["urls", url]);
}

const dequeue = async () => {
    return (await redisClient.lpopAsync("urls"));
}

const isOverLimit = async (ip, currTime, limit) => {
    let lastTime = await redisClient.getAsync(ip);
    if (lastTime === null || (currTime - lastTime) > limit) {
        return false;
    } else {
        return true;
    }
}


module.exports = {
    enqueue,
    dequeue,
    logRequest,
    isOverLimit
}