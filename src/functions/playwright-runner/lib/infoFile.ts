import { getS3IndexKey, getS3InfoFileKey, getS3KeyPrefix } from "./fileName";
import { loadJson, saveFile } from "./stream";

import type {
  PlaywrightRunnerEvent,
  PlaywrightRunnerIndex,
  PlaywrightRunnerResult,
  PlaywrightRunnerResultTargets,
} from "./types";

export const updateIndexFile = async ({ timestamp, baseUrl, note }: PlaywrightRunnerEvent) => {
  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);
  const s3InfoFileKey = getS3InfoFileKey(s3KeyPrefix);

  const s3IndexKey = getS3IndexKey();

  let indexJson = await loadJson<PlaywrightRunnerIndex>(s3IndexKey);
  if (!indexJson) {
    // 初回実行時はファイルがないため空配列をセット
    indexJson = [];
  }

  const info = indexJson.find((item) => item.timestamp === timestamp && item.baseUrl === baseUrl);
  if (info) {
    // 既に存在する場合は更新しない
    return;
  }

  indexJson.push({ timestamp, baseUrl, note, s3InfoFileKey });
  await saveFile(s3IndexKey, Buffer.from(JSON.stringify(indexJson)));
};

export const updateInfoFile = async (
  { timestamp, baseUrl, note }: PlaywrightRunnerEvent,
  uploadedTargets: PlaywrightRunnerResultTargets,
) => {
  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);
  const s3InfoFileKey = getS3InfoFileKey(s3KeyPrefix);

  let infoJson = await loadJson<PlaywrightRunnerResult>(s3InfoFileKey);

  if (infoJson) {
    infoJson.targets.push(...uploadedTargets);
  } else {
    infoJson = { timestamp, baseUrl, targets: uploadedTargets, note };
  }

  await saveFile(s3InfoFileKey, Buffer.from(JSON.stringify(infoJson)));
};
