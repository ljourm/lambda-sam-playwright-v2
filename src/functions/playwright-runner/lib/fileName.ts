import { PlaywrightRunnerTarget } from "./types";

const sanitizePath = (path: string): string => {
  return path.replace(/^\/+|\/+$/g, "").replace(/\//g, "_");
};

// e.g.
// - "/" -> "index-1200.png"
// - "/articles/" -> "articles-1200.png"
// - "/articles/category/page/" -> "articles_category_page-1200.png"
export const getFileName = (target: PlaywrightRunnerTarget, num?: number): string => {
  const sanitizedPath = target.path === "/" ? "index" : sanitizePath(target.path);

  if (typeof num === "number") {
    return `${sanitizedPath}-${target.width}-${num}.png`;
  } else {
    return `${sanitizedPath}-${target.width}.png`;
  }
};

// 戻り値の例: snapshots/example.com/2025-01-23-01-23-45/
export const getS3KeyPrefix = (baseUrl: string, timestamp: string): string => {
  const domain = baseUrl.replace("https://", "").replace("/", "");

  return `snapshots/${domain}/${timestamp}`;
};

// 戻り値の例: snapshots/example.com/2025-01-23-01-23-45/articles_category_page-1200.png
export const getS3Key = (prefix: string, target: PlaywrightRunnerTarget, num?: number): string => {
  return `${prefix}/${getFileName(target, num)}`;
};

// 戻り値の例: snapshots/example.com/2025-01-23-01-23-45/info.json
export const getS3InfoFileKey = (prefix: string): string => {
  return `${prefix}/info.json`;
};

export const getS3IndexKey = (): string => {
  return `snapshots/index.json`;
};
