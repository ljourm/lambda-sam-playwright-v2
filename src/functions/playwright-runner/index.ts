import { Context } from "aws-lambda";
import { chromium as playwright } from "playwright-core";
import chromium from "@sparticuz/chromium";
import { PlaywrightRunnerEvent, PlaywrightRunnerTarget } from "./types";
import { snapshots } from "./playwright/snapshot";
import { uploadToS3 } from "./aws/s3";
import { getS3Key, getS3KeyPrefix } from "./aws/s3Key";
import { saveToFile } from "./util/file";
import { processConcurrent } from "./util/concurrency";
import { callNextLambda } from "./aws/lambda";
import { getSafeEnv } from "./util/env";

const MAX_LOOP_COUNT = 5; // Lambda関数の最大ループ回数 (15分で終わらない場合、関数を何度も呼び出す)

export const handler = async (event: PlaywrightRunnerEvent, context: Context): Promise<string> => {
  console.log("PlaywrightRunner started with event:", JSON.stringify(event));
  const { baseUrl, timestamp, targets, loopCount = 0 } = event;

  const env = getSafeEnv("ENV");
  console.log("ENV:", env);

  const browser = await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  });
  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);

  const snapshotAndSave = async (target: PlaywrightRunnerTarget) => {
    const page = await browser.newPage();
    const buffer = await snapshots(page, baseUrl, target);
    const s3Key = getS3Key(s3KeyPrefix, target);

    if (env === "local") {
      await saveToFile(s3Key, buffer);
    } else {
      await uploadToS3(s3Key, buffer);
    }

    await page.close();
  };

  const doContinue = () => {
    return context.getRemainingTimeInMillis() > 1000 * 60; // 60秒以上残っている場合に続行
  };

  const nextTargets = await processConcurrent(snapshotAndSave, targets, doContinue);

  await browser.close();

  // 未処理のターゲットがある場合は次のLambda呼び出しをトリガー
  if (nextTargets.remaining.length > 0) {
    console.log(
      `Remaining targets: ${nextTargets.remaining.length}. Current Loop count: ${loopCount}`,
    );

    const nextLoopCount = loopCount + 1;

    if (nextLoopCount >= MAX_LOOP_COUNT) {
      throw new Error("Maximum loop count reached.");
    }

    console.log(`Triggering next Lambda invocation`);

    await callNextLambda({
      baseUrl,
      timestamp,
      targets: nextTargets.remaining,
      loopCount: nextLoopCount,
    });
  } else {
    console.log("All targets processed.");
  }

  console.log("PlaywrightRunner completed successfully.");

  return "ok";
};
