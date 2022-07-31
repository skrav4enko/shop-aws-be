import type { AWS } from "@serverless/typescript";

import { handlerPath } from "@libs/handler-resolver";

const handler: AWS["functions"][""] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: "${self:provider.environment.S3_BUCKET_NAME}",
        event: "s3:ObjectCreated:*",
        rules: [
          {
            prefix: "${self:provider.environment.UPLOADED_PATH}",
          },
          {
            suffix: ".csv",
          },
        ],
        existing: true,
      },
    },
  ],
};

export default handler;
