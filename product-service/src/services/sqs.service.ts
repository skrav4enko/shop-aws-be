import { SQSRecord } from "aws-lambda";
import { SQS } from "aws-sdk";
import { logger } from "src/utils/logger";

function getSQSClient(): SQS {
  return new SQS();
}

function getQueueUrl({ sqs, eventSourceARN }) {
  const [, , , , accountId, queueName] = eventSourceARN.split(":");
  return `${sqs.endpoint.href}${accountId}/${queueName}`;
}

export async function deleteMessage(record: SQSRecord): Promise<void> {
  const sqs = getSQSClient();
  const { eventSourceARN, receiptHandle, body } = record;

  await sqs
    .deleteMessage({
      QueueUrl: getQueueUrl({
        sqs,
        eventSourceARN: eventSourceARN,
      }),
      ReceiptHandle: receiptHandle,
    })
    .promise()
    .then(
      () => {
        logger.log(JSON.stringify({ message: "SQS: Message removed", body }));
      },
      (error) => {
        logger.error(JSON.stringify({ message: "SQS: Message remove failed", body, error }));
      }
    );
}
