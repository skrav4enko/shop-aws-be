import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";

const S3_LOCAL_HOST = "localhost";
const S3_LOCAL_PORT = "4567";
const S3_LOCAL_ACCESS_KEY = "S3RVER";
const S3_BUCKET_NAME = "cloud-aws-import-products";
const UPLOADED_PATH = "uploaded";
const PARSED_PATH = "parsed";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  useDotenv: true,
  plugins: ["serverless-s3-local", "serverless-offline", "serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      S3_LOCAL_HOST,
      S3_LOCAL_PORT,
      S3_LOCAL_ACCESS_KEY,
      S3_BUCKET_NAME,
      UPLOADED_PATH,
      PARSED_PATH,
    },
    iam: {
      role: {
        statements: [
          // Allow functions to list all buckets
          {
            Effect: "Allow",
            Action: "s3:ListBucket",
            Resource: `arn:aws:s3:::${S3_BUCKET_NAME}`,
          },
          // Allow functions to read/write objects in a bucket
          {
            Effect: "Allow",
            Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            Resource: `arn:aws:s3:::${S3_BUCKET_NAME}/*`,
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    s3: {
      host: S3_LOCAL_HOST,
      port: S3_LOCAL_PORT,
    },
  },
};

module.exports = serverlessConfiguration;
