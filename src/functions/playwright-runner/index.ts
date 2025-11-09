import { Context } from "aws-lambda";

import { getSafeEnv } from "./lib/env";
import { run } from "./lib/runner";
import { PlaywrightRunnerEvent } from "./lib/types";

export const handler = async (event: PlaywrightRunnerEvent, context: Context): Promise<string> => {
  console.log("PlaywrightRunner started with event:", JSON.stringify(event));

  const env = getSafeEnv("ENV");
  const withoutDocker = getSafeEnv("WITHOUT_DOCKER");
  console.log(`ENV: ${env}, WITHOUT_DOCKER: ${withoutDocker}`);

  await run(event, context);

  console.log("PlaywrightRunner completed successfully.");

  return "ok";
};
