import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";

import { getSafeEnv } from "@/lib/env";

import type { Browser, BrowserContext, Route } from "playwright-core";

// Docker環境かどうかでブラウザの起動方法を切り替ええる。Dockerの場合、@sparticuz/chromiumの環境設定を使用する。
export const getBrowser = async (): Promise<Browser> => {
  if (process.env.WITHOUT_DOCKER === "true") {
    return await playwright.launch();
  }

  return await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  });
};

// 指定したドメインのみ許可し、それ以外はブロックする
const doContinueForDomain = (route: Route) => {
  const allowSnapshotDomains = getSafeEnv("ALLOW_SNAPSHOT_DOMAIN").split(",");

  try {
    const hostname = new URL(route.request().url()).hostname;
    const isAllowed = allowSnapshotDomains.some((domain) => hostname.endsWith(domain));

    if (isAllowed) {
      route.continue();
    } else {
      route.abort();
    }
  } catch {
    // 無効なURLはブロック
    route.abort();
  }
};

export const getBrowserContext = async (browser: Browser): Promise<BrowserContext> => {
  const context = await browser.newContext();
  await context.route("**/*", doContinueForDomain);

  return context;
};
