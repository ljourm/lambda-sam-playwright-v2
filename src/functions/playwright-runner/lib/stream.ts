import { getSafeEnv } from "@/lib/env";

import { getJsonFromS3, uploadToS3 } from "./awsHelper/s3";
import { saveToLocalFile } from "./file";

export const loadJson = async <T>(key: string): Promise<T | null> => {
  const env = getSafeEnv("ENV");

  if (["stg", "prd"].includes(env)) {
    return await getJsonFromS3<T>(key);
  } else {
    // 返却できる対象がないためnullを返す
    return null;
  }
};

export const saveFile = async (key: string, buffer: Buffer) => {
  const env = getSafeEnv("ENV");

  if (["stg", "prd"].includes(env)) {
    await uploadToS3(key, buffer);
  } else {
    await saveToLocalFile(key, buffer);
  }
};

export const saveFileFromJson = async (key: string, data: unknown) => {
  const buffer = Buffer.from(JSON.stringify(data));
  await saveFile(key, buffer);
};
