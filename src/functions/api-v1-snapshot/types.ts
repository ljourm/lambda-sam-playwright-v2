import type { PlaywrightRunnerTarget } from "@/lib/types";

export type eventRequestBody = {
  baseUrl: string;
  targets: PlaywrightRunnerTarget[];
  note?: string;
};
