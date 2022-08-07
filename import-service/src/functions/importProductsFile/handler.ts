import { APIGatewayProxyEvent } from "aws-lambda";
import { StatusCodes } from "http-status-codes";

import { formatJSONResponse } from "@libs/api-gateway";
import { AppCustomError } from "@libs/app-custom-error";
import { middyfy } from "@libs/lambda";
import * as importService from "src/services/import.service";

export const INCORRECT_FILENAME_MESSAGE = "File name should be *.csv";

const importProductsFile = async (event: APIGatewayProxyEvent) => {
  const { name: fileName } = event.queryStringParameters || {};

  if (!fileName || !fileName.endsWith(".csv")) {
    throw new AppCustomError(INCORRECT_FILENAME_MESSAGE, StatusCodes.BAD_REQUEST);
  }

  const fileUrl = await importService.importProductsFile(fileName);

  return formatJSONResponse({ fileUrl });
};

export const main = middyfy(importProductsFile);
