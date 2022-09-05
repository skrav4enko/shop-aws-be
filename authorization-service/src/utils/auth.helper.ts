import { logger } from "src/utils/logger";

export const BasicScheme = "Basic";

export enum AuthorizerType {
  Token = "TOKEN",
  Request = "REQUEST",
}

export enum StatementEffect {
  Allow = "Allow",
  Deny = "Deny",
}

export interface Credentials {
  username: string;
  password: string;
}

export function decodeBasicToken(authorizationToken: string): Credentials {
  const decodedCredentials = Buffer.from(authorizationToken, "base64").toString("utf-8");

  logger.log(JSON.stringify({ message: "Decoded credentials", decodedCredentials }));

  const [username, password] = decodedCredentials.split(":");

  return {
    username,
    password,
  };
}

export function generatePolicy(username: string, methodArn: string, effect: StatementEffect) {
  return {
    principalId: username,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: methodArn,
        },
      ],
    },
  };
}
