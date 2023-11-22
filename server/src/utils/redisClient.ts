// redisClient.js
import Redis from "ioredis";

let redisClient = null;

const initializeRedis = () => {
  const port = Number(
    process.env.NODE_ENV === "production"
      ? process.env.REDIS_LABS_PORT
      : process.env.REDIS_DOCKER_PORT
  );
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

  redisClient = new Redis(port, host, options);

  redisClient.on("connect", () => {
    console.log("Redis client connected");
  });

  redisClient.on("error", (err) => {
    console.error("Redis error", err);
  });

  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    initializeRedis();
  }
  return redisClient;
};
