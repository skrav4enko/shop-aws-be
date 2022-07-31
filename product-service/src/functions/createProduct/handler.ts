import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { AppCustomError } from "@libs/app-custom-error";

import { Product, ProductServiceInterface } from "@services/product.interface";
import { getProductService } from "@services/get-product-service";
import { logger } from "src/utils/logger";
import schema from "./schema";

export const createHandler = (productService: ProductServiceInterface) => {
  const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const productData = event.body as Omit<Product, "id">;

    try {
      logger.log(JSON.stringify({ message: `Creating Product`, productData, event }));

      const createdProduct = await productService.createProduct(productData);

      logger.log(JSON.stringify({ message: `Product has been created`, createdProduct }));

      return formatJSONResponse({ success: true, data: createdProduct });
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

  return createProduct;
};

export const main = middyfy(createHandler(getProductService()));
