import { callNextLambda } from "./awsHelper/lambda";
import { processConcurrent } from "./concurrency";
import { MAX_LAMBDA_LOOP_COUNT } from "./const";
import { getS3Key, getS3KeyPrefix } from "./fileName";
import { updateIndexFile, updateInfoFile } from "./infoFile";
import { getBrowser, getBrowserContext } from "./playwrightHelper/browser";
import { snapshots } from "./playwrightHelper/snapshot";
import { saveFile } from "./stream";

import type {
  PlaywrightRunnerEvent,
  PlaywrightRunnerResultTargets,
  PlaywrightRunnerTarget,
} from "./types";
import type { Context } from "aws-lambda";

export const run = async (event: PlaywrightRunnerEvent, context: Context) => {
  try {
    await process(event, context);
  } catch (error) {
    console.error("Error occurred during processing:", error);

    const status = "failed";
    await updateIndexFile(event, { status });
    await updateInfoFile(event, {
      uploadedTargets: [],
      status,
      loopCount: event.loopCount ?? 0,
      errorMessage: (error as Error).message,
    });

    throw error;
  }
};

const process = async (event: PlaywrightRunnerEvent, context: Context) => {
  const { baseUrl, timestamp, basicAuth, targets, loopCount = 0 } = event;

  // indexファイルの更新（ステータスをrunningに設定）
  await updateIndexFile(event, { status: "running" });
  await updateInfoFile(event, { uploadedTargets: [], status: "running", loopCount });

  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);

  const browser = await getBrowser();
  const browserContext = await getBrowserContext(browser, baseUrl, basicAuth);

  const uploadedTargets: PlaywrightRunnerResultTargets = [];

  const snapshotAndSave = async (target: PlaywrightRunnerTarget) => {
    const page = await browserContext.newPage();
    const buffers = await snapshots(page, target);
    const keys: string[] = [];

    buffers.forEach(async (buffer, index) => {
      const s3Key = getS3Key(s3KeyPrefix, target, buffers.length === 1 ? undefined : index + 1);
      keys.push(s3Key);

      await saveFile(s3Key, buffer);
    });

    uploadedTargets.push({ ...target, keys });

    await page.close();
  };

  const doContinue = () => {
    return context.getRemainingTimeInMillis() > 1000 * 60; // 60秒以上残っている場合に続行
  };

  const nextTargets = await processConcurrent(snapshotAndSave, targets, doContinue);

  await browserContext.close();
  await browser.close();

  const status = nextTargets.length === 0 ? "completed" : "running";
  await updateIndexFile(event, { status });
  await updateInfoFile(event, { uploadedTargets, status, loopCount });

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
