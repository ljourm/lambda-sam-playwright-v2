import { Context } from "aws-lambda";

import { callNextLambda } from "./awsHelper/lambda";
import { uploadToS3 } from "./awsHelper/s3";
import { processConcurrent } from "./concurrency";
import { MAX_LAMBDA_LOOP_COUNT } from "./const";
import { getSafeEnv } from "./env";
import { saveToFile } from "./file";
import { getS3Key, getS3KeyPrefix } from "./fileName";
import { getBrowser, getBrowserContext } from "./playwrightHelper/browser";
import { snapshots } from "./playwrightHelper/snapshot";
import { PlaywrightRunnerEvent, PlaywrightRunnerTarget } from "./types";

export const run = async (
  { baseUrl, timestamp, targets, loopCount = 0 }: PlaywrightRunnerEvent,
  context: Context,
) => {
  const env = getSafeEnv("ENV");
  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);

  const browser = await getBrowser();
  const browserContext = await getBrowserContext(browser);

  const snapshotAndSave = async (target: PlaywrightRunnerTarget) => {
    const page = await browserContext.newPage();
    const buffers = await snapshots(page, baseUrl, target);

    buffers.forEach(async (buffer, index) => {
      const s3Key = getS3Key(s3KeyPrefix, target, buffers.length === 1 ? undefined : index + 1);

      if (["stg", "prd"].includes(env)) {
        await uploadToS3(s3Key, buffer);
      } else {
        await saveToFile(s3Key, buffer);
      }
    });

    await page.close();
  };

  const doContinue = () => {
    return context.getRemainingTimeInMillis() > 1000 * 60; // 60秒以上残っている場合に続行
  };

  const nextTargets = await processConcurrent(snapshotAndSave, targets, doContinue);

  await browserContext.close();
  await browser.close();

  if (nextTargets.length === 0) {
    // 全てのターゲットが処理済みの場合は終了
    console.log("All targets processed.");
    return;
  }

  // 未処理のターゲットがある場合は次のLambda呼び出しをトリガー
  console.log(`Remaining targets: ${nextTargets.length}. Current Loop count: ${loopCount}`);

  const nextLoopCount = loopCount + 1;
  if (nextLoopCount >= MAX_LAMBDA_LOOP_COUNT) {
    throw new Error("Maximum loop count reached.");
  }

  await callNextLambda({
    baseUrl,
    timestamp,
    targets: nextTargets,
    loopCount: nextLoopCount,
  });

  console.log("Invoked next Lambda for remaining targets.");
};
