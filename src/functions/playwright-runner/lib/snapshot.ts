import { Page } from "playwright-core";

import { SNAPSHOT_TIMEOUT_MS, VIEWPORT_HEIGHT } from "./const";
import { PlaywrightRunnerTarget } from "./types";

const isSuccessfulStatus = (status?: number): boolean => {
  if (!status) return false;
  if (200 <= status && status <= 299) return true;
  if (status === 404) return true;

  return false;
};

export const snapshots = async (
  page: Page,
  baseUrl: string,
  target: PlaywrightRunnerTarget,
): Promise<Buffer> => {
  const url = baseUrl.replace(/\/$/, "") + target.path;

  await page.setViewportSize({ width: target.width, height: VIEWPORT_HEIGHT });
  const response = await page.goto(url, { waitUntil: "networkidle" });

  // スクロールしてLazy Load対策 (最下部までスクロールして1秒待機)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // 200〜200、404以外はエラー終了とする
  if (!isSuccessfulStatus(response?.status())) {
    throw new Error(`Failed to load URL: ${url}, status: ${response?.status()}`);
  }

  return await page.screenshot({ fullPage: true, type: "png" });
};
