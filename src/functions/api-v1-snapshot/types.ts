import type { PlaywrightRunnerTarget } from "@/lib/types";

export type eventRequestBody = {
  baseUrl: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  targets: PlaywrightRunnerTarget[];
  note?: string;
};
