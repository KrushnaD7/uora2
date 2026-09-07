import { ApiError } from "./ApiError";

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}