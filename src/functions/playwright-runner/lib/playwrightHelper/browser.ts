import chromium from "@sparticuz/chromium";
import { Browser, BrowserContext, chromium as playwright, Route } from "playwright-core";

import { ALLOW_DOMAINS } from "../const";
import { getSafeEnv } from "../env";

// Docker環境かどうかでブラウザの起動方法を切り替ええる。Dockerの場合、@sparticuz/chromiumの環境設定を使用する。
export const getBrowser = async (): Promise<Browser> => {
  const withoutDocker = getSafeEnv("WITHOUT_DOCKER");

  if (withoutDocker === "true") {
    return await playwright.launch();
  }

  return await playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  });
};

// 指定したドメインのみ許可し、それ以外はブロックする
const doContinueForDomain = (route: Route) => {
  try {
    const hostname = new URL(route.request().url()).hostname;
    const isAllowed = ALLOW_DOMAINS.some((domain) => hostname.endsWith(domain));

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
