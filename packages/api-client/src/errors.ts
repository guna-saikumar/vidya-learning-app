export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }

  /** Alias for callers that expect `statusCode`. */
  get statusCode(): number {
    return this.status;
  }
}