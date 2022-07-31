import type { AWS } from "@serverless/typescript";

import { handlerPath } from "@libs/handler-resolver";

const handler: AWS["functions"][""] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        arn: "${cf:import-service-${self:provider.stage}.SQSQueueArn}",
        batchSize: 5,
      },
    },
  ],
};

export default handler;
