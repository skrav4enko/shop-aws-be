import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { mockData } from "../../mock-data/mock.js";

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const { productId } = event.pathParameters;

  const product = mockData.find((item) => item.id === productId);

  if (!product) {
    const errorResponse = {
      success: false,
      message: "Product not found!",
    };

    return {
      statusCode: 404,
      body: JSON.stringify(errorResponse),
    };
  }

  return formatJSONResponse({ success: true, data: product });
};

export const main = middyfy(getProductsById);
