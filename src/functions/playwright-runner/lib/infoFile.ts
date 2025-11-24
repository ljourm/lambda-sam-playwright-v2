import { getS3IndexKey, getS3InfoFileKey, getS3KeyPrefix } from "./fileName";
import { loadJson, saveFileFromJson } from "./stream";

import type {
  PlaywrightRunnerEvent,
  PlaywrightRunnerIndex,
  PlaywrightRunnerResult,
  PlaywrightRunnerResultTargets,
  RunnerStatus,
} from "./types";

export const updateIndexFile = async (
  { timestamp, baseUrl, note }: PlaywrightRunnerEvent,
  { status }: { status: RunnerStatus },
) => {
  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);
  const s3InfoFileKey = getS3InfoFileKey(s3KeyPrefix);

  const s3IndexKey = getS3IndexKey();

  const indexJson = await loadJson<PlaywrightRunnerIndex>(s3IndexKey);

  if (!indexJson) {
    // ファイルなし (デプロイ直後)
    await saveFileFromJson(s3IndexKey, [{ status, timestamp, baseUrl, note, s3InfoFileKey }]);
    return;
  }

  const info = indexJson.find((item) => item.timestamp === timestamp && item.baseUrl === baseUrl);

  if (!info) {
    // 今回の実行分なし
    indexJson.push({ status, timestamp, baseUrl, note, s3InfoFileKey });
    await saveFileFromJson(s3IndexKey, indexJson);
    return;
  }

  if (info.status !== status) {
    // 既に存在し、ステータスが異なる (更新される可能性があるのはstatusのみ)
    info.status = status;
    await saveFileFromJson(s3IndexKey, indexJson);
    return;
  }
};

export const updateInfoFile = async (
  { timestamp, baseUrl, note }: PlaywrightRunnerEvent,
  {
    uploadedTargets,
    status,
    loopCount,
    errorMessage,
  }: {
    uploadedTargets: PlaywrightRunnerResultTargets;
    status: RunnerStatus;
    loopCount: number;
    errorMessage?: string;
  },
) => {
  const s3KeyPrefix = getS3KeyPrefix(baseUrl, timestamp);
  const s3InfoFileKey = getS3InfoFileKey(s3KeyPrefix);

  const previousInfoJson = await loadJson<PlaywrightRunnerResult>(s3InfoFileKey);
  const previousTargets = previousInfoJson ? previousInfoJson.targets : [];

  const infoJson: PlaywrightRunnerResult = {
    status,
    loopCount: loopCount + 1, // 表示用には0でなく1から始まる数値を使用
    timestamp,
    baseUrl,
    targets: [...previousTargets, ...uploadedTargets],
    note,
    errorMessage,
  };

  await saveFileFromJson(s3InfoFileKey, infoJson);
};
