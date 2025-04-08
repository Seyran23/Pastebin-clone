const { createClient } = require("redis");
const { REDIS_URL } = require("./enviromentVariables");

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Error connecting to Redis: ", err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection failed: ", err);
  }
})();

module.exports = redisClient;
