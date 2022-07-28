import { StatusCodes, ReasonPhrases } from "http-status-codes";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { AppCustomError } from "@libs/app-custom-error";

import { getProductService } from "@services/get-product-service";
import { ProductServiceInterface } from "@services/product.interface";
import schema from "./schema";
import { logger } from "src/utils/logger";

export const createHandler = (productService: ProductServiceInterface) => {
  const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    try {
      logger.log(JSON.stringify({ message: "Fetching products", event }));

      const products = await productService.getProductsList();

      return formatJSONResponse({ success: true, data: products });
    } catch (error) {
      if (error instanceof AppCustomError) {
        const { message, statusCode } = error;

        logger.error(JSON.stringify({ message, error }));

        return formatJSONResponse({ message }, statusCode);
      }

      logger.error(JSON.stringify({ message: ReasonPhrases.INTERNAL_SERVER_ERROR, error }));

      return formatJSONResponse({ message: ReasonPhrases.INTERNAL_SERVER_ERROR }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  return getProductsList;
};

export const main = middyfy(createHandler(getProductService()));
