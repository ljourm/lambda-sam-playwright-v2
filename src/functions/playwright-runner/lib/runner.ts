import { getSafeEnv } from "@/lib/env";

import { callNextLambda } from "./awsHelper/lambda";
import { processConcurrent } from "./concurrency";
import { MAX_LAMBDA_LOOP_COUNT } from "./const";
import { getS3IndexKey, getS3InfoFileKey, getS3Key, getS3KeyPrefix } from "./fileName";
import { getBrowser, getBrowserContext } from "./playwrightHelper/browser";
import { snapshots } from "./playwrightHelper/snapshot";
import { loadJson, saveFile } from "./stream";

import type {
  PlaywrightRunnerEvent,
  PlaywrightRunnerIndex,
  PlaywrightRunnerResult,
  PlaywrightRunnerResultTargets,
  PlaywrightRunnerTarget,
} from "./types";
import type { Context } from "aws-lambda";

export const run = async (
  { baseUrl, timestamp, basicAuth, targets, loopCount = 0, note }: PlaywrightRunnerEvent,
  context: Context,
) => {
  const env = getSafeEnv("ENV");
  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);

  const browser = await getBrowser();
  const browserContext = await getBrowserContext(browser, baseUrl, basicAuth);

  const resultTargets: PlaywrightRunnerResultTargets = [];

  const snapshotAndSave = async (target: PlaywrightRunnerTarget) => {
    const page = await browserContext.newPage();
    const buffers = await snapshots(page, target);
    const keys: string[] = [];

    buffers.forEach(async (buffer, index) => {
      const s3Key = getS3Key(s3KeyPrefix, target, buffers.length === 1 ? undefined : index + 1);
      keys.push(s3Key);

      await saveFile(env, s3Key, buffer);
    });

    resultTargets.push({ ...target, keys });

    await page.close();
  };

  const doContinue = () => {
    return context.getRemainingTimeInMillis() > 1000 * 60; // 60秒以上残っている場合に続行
  };

  const nextTargets = await processConcurrent(snapshotAndSave, targets, doContinue);

  await browserContext.close();
  await browser.close();

  // 結果ファイルのアップロード
  const s3InfoFileKey = getS3InfoFileKey(s3KeyPrefix);
  let infoJson = await loadJson<PlaywrightRunnerResult>(env, s3InfoFileKey);
  if (infoJson) {
    infoJson.targets.push(...resultTargets);
  } else {
    infoJson = { timestamp, baseUrl, targets: resultTargets, note };
  }
  await saveFile(env, s3InfoFileKey, Buffer.from(JSON.stringify(infoJson)));

  const s3IndexKey = getS3IndexKey();
  let indexJson = await loadJson<PlaywrightRunnerIndex>(env, s3IndexKey);
  if (indexJson) {
    indexJson.push({ timestamp, baseUrl, s3InfoFileKey, note });
  } else {
    indexJson = [{ timestamp, baseUrl, s3InfoFileKey, note }];
  }
  await saveFile(env, s3IndexKey, Buffer.from(JSON.stringify(indexJson)));

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
