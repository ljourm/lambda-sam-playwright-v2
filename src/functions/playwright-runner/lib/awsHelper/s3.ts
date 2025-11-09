import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

import { getSafeEnv } from "../env";

const s3 = new S3Client({});

export const uploadToS3 = async (key: string, buffer: Buffer) => {
  const bucketName = getSafeEnv("S3_DEST_BUCKET_NAME");

  const params: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: "image/png",
  };

  await s3.send(new PutObjectCommand(params));

  console.log(`Uploaded to s3://${bucketName}/${key}`);
};
