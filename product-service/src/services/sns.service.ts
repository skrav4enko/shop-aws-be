import { SNS } from "aws-sdk";
import { PublishInput, PublishResponse } from "aws-sdk/clients/sns";
import { logger } from "src/utils/logger";

function getSNSClient(): SNS {
  return new SNS();
}

export function publishSNSMessage(params: PublishInput): Promise<PublishResponse> {
  const sns = getSNSClient();

  return new Promise((resolve, reject) => {
    sns.publish(params, (error, response) => {
      if (error) {
        logger.error(JSON.stringify({ message: "SNS Error: ", error }));
        reject(error);
      } else {
        logger.log(JSON.stringify({ message: "SNS Response: ", response }));
        resolve(response);
      }
    });
  });
}
