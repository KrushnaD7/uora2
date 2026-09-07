import { ApiError } from "./ApiError";

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}