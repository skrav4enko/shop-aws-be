import { SQSEvent, SQSRecord } from "aws-lambda";

import { middyfyS3 } from "@libs/lambda";
import { Product, ProductServiceInterface } from "@services/product.interface";
import * as sns from "@services/sns.service";
import * as sqs from "@services/sqs.service";
import { getProductService } from "@services/get-product-service";
import { logger } from "src/utils/logger";

export async function createBatchProduct(
  productService: ProductServiceInterface,
  products: Product[],
  records: SQSRecord[]
): Promise<void> {
  await Promise.all(products.map(productService.createProduct));

  const results = await Promise.allSettled(products.map((product) => productService.createProduct(product)));

  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const isSuccess = result.status === "fulfilled";
    const product = products[index];

    if (isSuccess) {
      await sqs.deleteMessage(records[index]).catch(() => logger.error("deleteMessage"));
    }

    await sns
      .publishSNSMessage({
        Subject: isSuccess ? "New product added" : "New product FAIL",
        Message: JSON.stringify(products[index]),
        TopicArn: process.env.SNS_TOPIC_ARN,
        MessageAttributes: {
          price: {
            DataType: "Number",
            StringValue: `${product.price}`,
          },
        },
      })
      .catch(() => logger.error("publishSNSMessage"));
  }
}

export const createHandler = (productService: ProductServiceInterface) => {
  const catalogBatchProcess = async (event: SQSEvent) => {
    const { Records } = event;

    const products: Product[] = Records.map((record) => JSON.parse(record.body));

    await createBatchProduct(productService, products, Records);
  };

  return catalogBatchProcess;
};

export const main = middyfyS3(createHandler(getProductService()));
