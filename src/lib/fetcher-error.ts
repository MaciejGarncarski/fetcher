export type FetcherErrorData = {
  errorMessage: string;
  data?: unknown;
  statusCode?: number;
  headers: Record<string, string>;
};

export class FetcherError extends Error {
  errorMessage: string;
  statusCode?: number;
  data?: unknown;
  headers: Record<string, string>;
  isError: true;

  constructor(data: FetcherErrorData) {
    super(data.errorMessage);
    this.errorMessage = data.errorMessage;
    this.data = data.data;
    this.statusCode = data.statusCode;
    this.headers = data.headers;
    this.isError = true;
  }
}
