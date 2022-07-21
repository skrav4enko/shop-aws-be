import { StatusCodes } from "http-status-codes";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { AppCustomError } from "@libs/app-custom-error";

import { ProductServiceInterface } from "@services/product.interface";
import { getProductService } from "@services/get-product-service";
import schema from "./schema";

export const createHandler = (productService: ProductServiceInterface) => {
  const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { productId } = event.pathParameters;

    try {
      const product = await productService.getProductById(productId);

      return formatJSONResponse({ success: true, data: product });
    } catch (error) {
      if (error instanceof AppCustomError) {
        const { message, statusCode } = error;

        return formatJSONResponse({ message }, statusCode);
      }

      return formatJSONResponse({ message: "Unknown error" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  return getProductById;
};

export const main = middyfy(createHandler(getProductService()));
