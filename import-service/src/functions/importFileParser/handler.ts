import { S3Event } from "aws-lambda";

import { middyfyS3 } from "@libs/lambda";
import * as importService from "src/services/import.service";

const importFileParser = async (event: S3Event) => {
  const { Records } = event;

  for (const record of Records) {
    await importService.parseProductsFile(record.s3.object.key);
  }
};

export const main = middyfyS3(importFileParser);
