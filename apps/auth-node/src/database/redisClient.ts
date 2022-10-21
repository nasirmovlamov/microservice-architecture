require("dotenv").config();

import { createClient } from "redis";

const client = createClient();
client.on("connect", () => console.log("Redis Client Connected"));
client.on("error", (err) => console.log("Redis Client Error"));

export const startRedisClient = async () => {
  await client.connect();
};

export const getRedisClient = () => client;

export const setValueToRedis = async (key: string, value: string) => {
  await client.set(key, value);
};
export const getValueFromRedis = async (key: string) => {
  return await client.get(key);
};
