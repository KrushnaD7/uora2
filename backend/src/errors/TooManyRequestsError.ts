import { ApiError } from "./ApiError";

export class TooManyRequestsError extends ApiError {
  constructor(message = "Too many requests, please try again later") {
    super(429, message);
  }
}
