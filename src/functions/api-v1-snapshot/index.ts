import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { format } from "date-fns";

type RequestBody = {
  baseUrl: string;
  targets: { path: string; width: number }[];
};

export const getSafeEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
};

// リクエストのバリデーションのためanyを許容
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateRequestBody = (body: any): body is RequestBody => {
  if (typeof body !== "object" || body === null) return false;
  if (typeof body.baseUrl !== "string") return false;
  if (!Array.isArray(body.targets)) return false;
  for (const target of body.targets) {
    if (typeof target.path !== "string" || typeof target.width !== "number") {
      return false;
    }
  }
  return true;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log("event:", JSON.stringify(event));

  const env = getSafeEnv("ENV");
  const playwrightFunctionName = getSafeEnv("PLAYWRIGHT_RUNNER_FUNCTION_NAME");
  console.log("ENV:", env, "PLAYWRIGHT_RUNNER_FUNCTION_NAME:", playwrightFunctionName);

  const body = JSON.parse(event.body || "{}");

  if (!validateRequestBody(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body" }),
    };
  }

  const lambdaClient = new LambdaClient({});

  const payload = {
    baseUrl: body.baseUrl,
    targets: body.targets,
    timestamp: format(new Date(), "yyyyMMddHHmmss"),
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
    body: JSON.stringify({ message: "created" }),
  };
};
