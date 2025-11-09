import { Context } from "aws-lambda";
import { formatInTimeZone } from "date-fns-tz";

import { PlaywrightRunnerEvent } from "./lib/types";

import { handler } from "./";

process.env.ENV = "local";
process.env.WITHOUT_DOCKER = "true";

const event: PlaywrightRunnerEvent = {
  timestamp: formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd-HH-mm-ss"),
  baseUrl: "https://example.com/",
  targets: [{ path: "/", width: 1200 }],
};

const context: Context = {
  getRemainingTimeInMillis: () => 10 * 60 * 1000, // 10分
} as Context;

handler(event, context);
