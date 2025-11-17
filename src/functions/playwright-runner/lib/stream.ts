import { getJsonFromS3, uploadToS3 } from "./awsHelper/s3";
import { saveToLocalFile } from "./file";

export const loadJson = async <T>(env: string, key: string): Promise<T | null> => {
  if (["stg", "prd"].includes(env)) {
    return await getJsonFromS3<T>(key);
  } else {
    // 返却できる対象がないためnullを返す
    return null;
  }
};

export const saveFile = async (env: string, key: string, buffer: Buffer) => {
  if (["stg", "prd"].includes(env)) {
    await uploadToS3(key, buffer);
  } else {
    await saveToLocalFile(key, buffer);
  }
};
