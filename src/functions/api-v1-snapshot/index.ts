import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { formatInTimeZone } from "date-fns-tz";

import { getSafeEnv } from "@/lib/env";
import type { PlaywrightRunnerEvent } from "@/lib/types.js";

import { validateRequestBody } from "./validateRequestBody.js";

import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log("event:", JSON.stringify(event));

  const env = getSafeEnv("ENV");
  const playwrightFunctionName = getSafeEnv("PLAYWRIGHT_RUNNER_FUNCTION_NAME");
  console.log("ENV:", env, "PLAYWRIGHT_RUNNER_FUNCTION_NAME:", playwrightFunctionName);

  const body = JSON.parse(event.body || "{}");

  if (!validateRequestBody(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid request body",
        errors: validateRequestBody.errors?.map((error) => error.message),
      }),
    };
  }

  const lambdaClient = new LambdaClient({});

  const payload: PlaywrightRunnerEvent = {
    baseUrl: body.baseUrl,
    basicAuth: body.basicAuth,
    targets: body.targets,
    note: body.note,
    timestamp: formatInTimeZone(new Date(), "Asia/Tokyo", "yyyy-MM-dd-HH-mm-ss"), // 日本時間（JST）
  };

  if (env === "local") {
    console.log("Invoking function skipped:", playwrightFunctionName, "with payload:", payload);
  } else {
    console.log("Invoking function:", playwrightFunctionName, "with payload:", payload);
    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: playwrightFunctionName,
        InvocationType: "Event",
        Payload: Buffer.from(JSON.stringify(payload)),
      }),
    );
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "created", timestamp: payload.timestamp }),
  };
};
