import { ApiError } from "./ApiError";

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}