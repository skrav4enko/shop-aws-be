import { StatusCodes } from "http-status-codes";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { AppCustomError } from "@libs/app-custom-error";

import { Product, ProductServiceInterface } from "@services/product.interface";
import { getProductService } from "@services/get-product-service";
import schema from "./schema";

export const createHandler = (productService: ProductServiceInterface) => {
  const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const productData = event.body as Omit<Product, "id">;

    try {
      const createdProduct = await productService.createProduct(productData);

      return formatJSONResponse({ success: true, data: createdProduct });
    } catch (error) {
      if (error instanceof AppCustomError) {
        const { message, statusCode } = error;

        return formatJSONResponse({ message }, statusCode);
      }

      return formatJSONResponse({ message: "Unknown error" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  };

  return createProduct;
};

export const main = middyfy(createHandler(getProductService()));
