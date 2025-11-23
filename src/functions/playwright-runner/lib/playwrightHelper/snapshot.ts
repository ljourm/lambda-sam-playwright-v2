import { MAX_SNAPSHOT_HEIGHT, VIEWPORT_HEIGHT } from "../const";

import type { PlaywrightRunnerTarget } from "../types";
import type { Page } from "playwright-core";

const isSuccessfulStatus = (status?: number): boolean => {
  if (!status) return false;
  if (200 <= status && status <= 299) return true;
  if (status === 404) return true;

  return false;
};

const scrollEachScreen = async (page: Page, fullHeight: number) => {
  for (let offsetY = 0; offsetY < fullHeight; offsetY += VIEWPORT_HEIGHT) {
    await page.evaluate((y) => window.scrollTo(0, y), offsetY);
    await page.waitForTimeout(10); // スクロール後に少し待機
  }

  await page.waitForTimeout(1000); // 1秒待機しておく
  await page.evaluate(() => window.scrollTo(0, 0));
};

const snapshotWithClipping = async (
  page: Page,
  target: PlaywrightRunnerTarget,
): Promise<Buffer[]> => {
  const bufferSnapshots: Buffer[] = [];
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  for (let offsetY = 0; offsetY < fullHeight; offsetY += MAX_SNAPSHOT_HEIGHT) {
    const clipHeight = Math.min(MAX_SNAPSHOT_HEIGHT, fullHeight - offsetY);
    const clip = { x: 0, y: offsetY, width: target.width, height: clipHeight };

    bufferSnapshots.push(await page.screenshot({ fullPage: true, type: "png", clip }));
  }

  return bufferSnapshots;
};

export const snapshots = async (
  page: Page,
  baseUrl: string,
  target: PlaywrightRunnerTarget,
): Promise<Buffer[]> => {
  const url = baseUrl.replace(/\/$/, "") + target.path;

  await page.setViewportSize({ width: target.width, height: VIEWPORT_HEIGHT });
  const response = await page.goto(url);

  // 200〜200、404以外はエラー終了とする
  if (!isSuccessfulStatus(response?.status())) {
    throw new Error(`Failed to load URL: ${url}, status: ${response?.status()}`);
  }

  // beforeEvaluateが指定されていれば実行する
  if (target.beforeEvaluate) {
    await page.evaluate(target.beforeEvaluate);
  }

  if (target.fullPage) {
    // スクロールしてLazy Load対策 (最下部までスクロールして1秒待機)
    await scrollEachScreen(page, await page.evaluate(() => document.documentElement.scrollHeight));

    // Chromiumのスクリーンショットには高さ制限があるため、分割して撮影する
    return await snapshotWithClipping(page, target);
  } else {
    // 通常のスクリーンショット
    return [await page.screenshot({ fullPage: false, type: "png" })];
  }
};
