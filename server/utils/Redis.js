import Redis from "ioredis";

export const initializeRedis = async () => {
  const port =
    process.env.NODE_ENV === "production"
      ? process.env.REDIS_LABS_PORT
      : process.env.REDIS_DOCKER_PORT;
  const host =
    process.env.NODE_ENV === "production"
      ? process.env.REDIS_LABS_HOST
      : process.env.REDIS_DOCKER_HOST;
  const options =
    process.env.NODE_ENV === "production"
      ? {
          password: process.env.REDIS_LABS_PASSWORD,
        }
      : {};
  const redisClient = new Redis(port, host, options);
  redisClient.on("connect", () => {
    console.log("[Success] Redis Connected");
  });
  redisClient.on("error", (err) => {
    console.log("[Error] Redis error: " + err);
  });
  return redisClient;
};
