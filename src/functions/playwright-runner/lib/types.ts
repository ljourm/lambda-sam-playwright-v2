import type { PlaywrightRunnerEvent, PlaywrightRunnerTarget } from "@/lib/types";

export { PlaywrightRunnerEvent, PlaywrightRunnerTarget };

export type PlaywrightRunnerResultTargets = (PlaywrightRunnerTarget & {
  keys: string[];
})[];

export type RunnerStatus = "running" | "completed" | "failed";

export type PlaywrightRunnerIndex = {
  status: RunnerStatus;
  timestamp: string;
  baseUrl: string;
  s3InfoFileKey: string;
  note?: string;
}[];

export type PlaywrightRunnerResult = {
  status: RunnerStatus;
  loopCount: number;
  timestamp: string;
  baseUrl: string;
  targets: PlaywrightRunnerResultTargets;
  note?: string;
  errorMessage?: string;
};
