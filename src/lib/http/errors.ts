export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public readonly headers: Record<string, string> = {},
  ) {
    super(message);
  }
}
