// S3に静的ファイルをアップロードし、CloudFrontのキャッシュを削除するスクリプト
// Usage: pnpm tsx deployStatic <bucketName> <keyPrefix> <distDir> <distributionId>
// Example: pnpm tsx deployStatic my-bucket my-prefix ./dist E1ABCDEFG2HIJK

import fs from "fs";
import path from "path";

import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { glob } from "glob";

const accessKeyId: string = process.env.S3_ACCESS_KEY_ID!;
const secretAccessKey: string = process.env.S3_SECRET_ACCESS_KEY!;

const credentials = accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;
const awsClientParams = {
  region: "ap-northeast-1",
  credentials,
};

const s3Client = new S3Client(awsClientParams);
const cloudFrontClient = new CloudFrontClient(awsClientParams);

const contentTypes: { [key: string]: string } = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/vnd.microsoft.icon",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};
const charset = "charset=UTF-8";

const uploadFile = async (bucketName: string, key: string, filename: string): Promise<void> => {
  const fileStream = fs.createReadStream(filename);
  fileStream.on("error", function (error) {
    console.log(filename);
    throw error;
  });

  const contentType = contentTypes[path.extname(filename)];
  const cacheControl = contentType === "text/html" ? "no-cache,must-revalidate" : "max-age=2592000";

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
    ContentType: `${contentType}; ${charset}`,
    CacheControl: cacheControl,
  };
  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  console.log("uploaded", bucketName, key, contentType);
};

const uploadFiles = async (
  bucketName: string,
  keyPrefix: string,
  filenames: string[],
): Promise<void> => {
  const uploadPromises = filenames.map(async (filename) => {
    const key = `${keyPrefix}/${filename}`;
    await uploadFile(bucketName, key, filename);
  });

  await Promise.all(uploadPromises);
};

const invalidate = async (distributionId: string) => {
  const paths = ["/*"];
  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: { Quantity: paths.length, Items: paths },
    },
  };
  const command = new CreateInvalidationCommand(params);
  await cloudFrontClient.send(command);

  console.log("create invalidation", distributionId, paths);
};

const deployStatic = async (
  bucketName: string,
  keyPrefix: string,
  distDir: string,
  distributionId: string,
) => {
  try {
    process.chdir(distDir);

    const filenames = await glob("**/*", { nodir: true });

    // HTMLファイルのアップロードを最後にすることでアップロード前のJS・CSS・画像などが参照されないようにする
    const otherFilenames = filenames.filter((filename) => path.extname(filename) !== ".html");
    const htmlFilenames = filenames.filter((filename) => path.extname(filename) === ".html");

    // S3にアップロード
    await uploadFiles(bucketName, keyPrefix, otherFilenames);
    await uploadFiles(bucketName, keyPrefix, htmlFilenames);

    // CloudFrontのキャッシュを削除
    await invalidate(distributionId);
  } catch (error) {
    console.log(error);
  }
};

const args = process.argv;
if (args.length !== 6) {
  console.log("Usage: pnpm tsx deployStatic <bucketName> <keyPrefix> <distDir> <distributionId>");
  process.exit(1);
}
const bucketName = args[2];
const keyPrefix = args[3];
const distDir = args[4];
const distributionId = args[5];

await deployStatic(bucketName, keyPrefix, distDir, distributionId);
