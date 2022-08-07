import type { AWS } from "@serverless/typescript";
import { handlerPath } from "@libs/handler-resolver";

const handler: AWS["functions"][""] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        cors: true,
        request: {
          parameters: {
            querystrings: {
              name: true,
            },
          },
        },
      },
    },
  ],
};

export default handler;
