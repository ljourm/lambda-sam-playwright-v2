import type { PlaywrightRunnerEvent, PlaywrightRunnerTarget } from "@/lib/types";

export { PlaywrightRunnerEvent, PlaywrightRunnerTarget };

export type PlaywrightRunnerResultTargets = (PlaywrightRunnerTarget & {
  keys: string[];
})[];

export type PlaywrightRunnerResult = {
  timestamp: string;
  baseUrl: string;
  targets: PlaywrightRunnerResultTargets;
  note?: string;
};

export type PlaywrightRunnerIndex = {
  timestamp: string;
  baseUrl: string;
  s3InfoFileKey: string;
  note?: string;
}[];
