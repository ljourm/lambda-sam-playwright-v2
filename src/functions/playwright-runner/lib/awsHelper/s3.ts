import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

import { getSafeEnv } from "@/lib/env";

import type { PutObjectCommandInput } from "@aws-sdk/client-s3";

const s3 = new S3Client({});

export const getJsonFromS3 = async <T>(key: string): Promise<T | null> => {
  const bucketName = getSafeEnv("S3_DEST_BUCKET_NAME");

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);

  try {
    const response = await s3.send(command);
    const str = (await response?.Body?.transformToString()) || "{}";

    return JSON.parse(str) as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      return null;
    }
    throw error;
  }
};

export const uploadToS3 = async (key: string, buffer: Buffer) => {
  const bucketName = getSafeEnv("S3_DEST_BUCKET_NAME");

  const contentType = key.endsWith(".json") ? "application/json" : "image/png";
  const cacheControl =
    contentType === "application/json" ? "no-cache,must-revalidate" : "max-age=2592000";

  const params: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: cacheControl,
  };

  await s3.send(new PutObjectCommand(params));

  console.log(`Uploaded to s3://${bucketName}/${key}`);
};
