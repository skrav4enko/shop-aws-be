import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import cors from "@middy/http-cors";
import middyEventNormalizer from "@middy/event-normalizer";

export const middyfy = (handler) => {
  return middy(handler).use(cors()).use(middyJsonBodyParser());
};

export const middyfyS3 = (handler) => {
  return middy(handler).use(middyEventNormalizer());
};
