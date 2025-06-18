export type FetcherErrorData = {
  message: string;
  data?: unknown;
  statusCode?: number;
  headers: Record<string, string>;
};

export class FetcherError extends Error {
  statusCode?: number;
  data?: unknown;
  headers: Record<string, string>;

  constructor(data: FetcherErrorData) {
    super(data.message);
    this.message = data.message;
    this.data = data.data;
    this.statusCode = data.statusCode;
    this.headers = data.headers;
  }
}
