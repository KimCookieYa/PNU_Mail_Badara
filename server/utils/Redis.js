import Redis from "ioredis";

export const initializeRedis = async () => {
  const redisClient = new Redis(6379, "redis-server");
  redisClient.on("connect", () => {
    console.log("[Success] Redis Connected");
  });
  redisClient.on("error", (err) => {
    console.log("[Error] Redis error: " + err);
  });
  return redisClient;
};
