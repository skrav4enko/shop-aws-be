import { pipeline } from "stream";
import { parse } from "csv-parse";

import { config } from "src/config";
import * as s3 from "src/services/s3.service";
import * as sqs from "src/services/sqs.service";
import { logger } from "src/utils/logger";

export async function importProductsFile(fileName: string): Promise<string> {
  const signedUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: config.S3_BUCKET_NAME,
    Key: `${config.UPLOADED_PATH}/${fileName}`,
    Expires: 60,
    ContentType: "text/csv",
  });

  return signedUrl;
}

export async function parseProductsFile(fileName: string): Promise<void> {
  logger.log(JSON.stringify({ message: "parseProductsFile", fileName }));

  const s3ReadStream = s3.createObjectReadStream({
    Bucket: config.S3_BUCKET_NAME,
    Key: fileName,
  });

  // Use the readable stream api to consume records
  const csvParserStream = parse().on("data", (product) => {
    logger.log(JSON.stringify({ message: "CSV Line", product }));

    sqs
      .sendSQSMessage({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(product),
      })
      .then(() => {
        logger.log(JSON.stringify({ message: "Product successfully sent to SQS", product }));
      })
      .catch((error) => {
        logger.error(JSON.stringify({ message: "Product delivery to SQS failed with error", error, product }));
      });
  });

  await new Promise((resolve, reject) => {
    pipeline(s3ReadStream, csvParserStream, async (error) => {
      if (error) {
        return reject(error);
      }

      try {
        await s3.copyObject({
          CopySource: `${config.S3_BUCKET_NAME}/${fileName}`,
          Bucket: config.S3_BUCKET_NAME,
          Key: fileName.replace(config.UPLOADED_PATH, config.PARSED_PATH),
        });

        await s3.deleteObject({
          Bucket: config.S3_BUCKET_NAME,
          Key: fileName,
        });

        resolve("CSV successfully parsed");
      } catch (err) {
        reject(err);
      }
    });
  });
}
