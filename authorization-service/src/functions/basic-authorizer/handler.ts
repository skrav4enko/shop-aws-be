import { middyfy } from "@libs/lambda";
import { AuthorizerType, BasicScheme, decodeBasicToken, generatePolicy, StatementEffect } from "src/utils/auth.helper";
import { logger } from "src/utils/logger";

const basicAuthorizer = async (event) => {
  logger.log(JSON.stringify({ message: `Event ===>`, event }));

  try {
    const { authorizationToken, methodArn, type } = event;

    if (type !== AuthorizerType.Token) {
      throw new Error("Basic authorizer supports only token authorization type");
    }

    logger.log(JSON.stringify({ message: "Authorization Token: ", authorizationToken }));

    const [schema, encodedCredentials] = authorizationToken.split(" ");

    if (schema !== BasicScheme) {
      logger.log("Token contains incorrect scheme for basic authorizer");

      return generatePolicy("none", methodArn, StatementEffect.Deny);
    }

    const { username, password } = decodeBasicToken(encodedCredentials);

    return username && password && process.env[username] === password
      ? generatePolicy(username, methodArn, StatementEffect.Allow)
      : generatePolicy(username, methodArn, StatementEffect.Deny);
  } catch (error) {
    console.log(JSON.stringify({ message: `Basic Authorizer Error: ${error.message}`, stack: error.stack }));

    throw error;
  }
};

export const main = middyfy(basicAuthorizer);
