export type PlaywrightRunnerTarget = {
  path: string;
  width: number;
  fullPage?: boolean;
  beforeEvaluate?: string;
};

export type PlaywrightRunnerEvent = {
  timestamp: string; // yyyy-MM-dd-HH-mm-ss
  baseUrl: string;
  targets: PlaywrightRunnerTarget[];
  loopCount?: number; // 0から開始。5回呼び出されて終了しなければ強制終了
};

export type PlaywrightRunnerResultTargets = (PlaywrightRunnerTarget & {
  keys: string[];
})[];

export type PlaywrightRunnerResult = {
  timestamp: string;
  baseUrl: string;
  targets: PlaywrightRunnerResultTargets;
};

export type PlaywrightRunnerIndex = {
  timestamp: string;
  baseUrl: string;
}[];
