import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

import { PlaywrightRunnerEvent } from "./types";

export const callNextLambda = async (payload: PlaywrightRunnerEvent): Promise<void> => {
  const lambdaClient = new LambdaClient({});
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME!;

  await lambdaClient.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: "Event", // 非同期呼び出し
      Payload: Buffer.from(JSON.stringify(payload)),
    }),
  );
};
