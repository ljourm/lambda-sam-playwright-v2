import { getFileName } from "./fileName";
import { PlaywrightRunnerTarget } from "./types";

// 戻り値の例: screenshots/example.com/20250123012345/
export const getS3KeyPrefix = (baseUrl: string, timestamp: string): string => {
  const domain = baseUrl.replace("https://", "").replace("/", "");

  return `screenshots/${domain}/${timestamp}`;
};

// 戻り値の例: screenshots/example.com/20250123012345/articles_category_page-1200.png
export const getS3Key = (prefix: string, target: PlaywrightRunnerTarget): string => {
  return `${prefix}/${getFileName(target)}`;
};
