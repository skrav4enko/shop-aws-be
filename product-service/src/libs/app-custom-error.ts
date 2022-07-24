import { StatusCodes } from "http-status-codes";

export class AppCustomError extends Error {
  statusCode: StatusCodes;

  constructor(message: string = "", statusCode: StatusCodes = StatusCodes.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
  }
}
