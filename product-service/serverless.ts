import type { AWS } from "@serverless/typescript";

import hello from "@functions/hello";
import getProductsList from "@functions/getProductsList";
import getProductById from "@functions/getProductById";
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";

const SNS_TOPIC_NAME = "createProductTopic";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  useDotenv: true,
  plugins: ["serverless-auto-swagger", "serverless-offline", "serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "sns:*",
            Resource: {
              Ref: "SNSTopic",
            },
          },
          {
            Effect: "Allow",
            Action: "sqs:*",
            Resource: "${cf:import-service-${self:provider.stage}.SQSQueueArn}",
          },
        ],
      },
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      PG_HOST: "shop-aws-db-instance.cdvypvjonlyd.eu-west-1.rds.amazonaws.com",
      PG_PORT: "5432",
      PG_DATABASE: "shop_aws_db",
      PG_USERNAME: "postgres",
      PG_PASSWORD: "${env:PG_PASSWORD}",
      SNS_TOPIC_ARN: {
        Ref: "SNSTopic",
      },
    },
  },
  // import the function via paths
  functions: { hello, getProductsList, getProductById, createProduct, catalogBatchProcess },
  package: { individually: true },
  resources: {
    Resources: {
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: SNS_TOPIC_NAME,
        },
      },
      SNSCheapBooksSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "${env:SNS_EMAIL_SUB_1}",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
          FilterPolicy: '{"price": [{"numeric": ["<", 10]}]}',
        },
      },
      SNSExpensiveBooksSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "${env:SNS_EMAIL_SUB_2}",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
          FilterPolicy: '{"price": [{"numeric": [">=", 10]}]}',
        },
      },
    },
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk", "pg-native"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    autoswagger: {
      basePath: "/dev",
      useStage: true,
      apiType: "http",
    },
  },
};

module.exports = serverlessConfiguration;
