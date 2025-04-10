export type FetcherErrorData = {
  message: string;
  statusCode?: number;
  toastMessage?: string;
  additionalMessage?: string;
};

export class FetcherError extends Error {
  statusCode?: number;
  toastMessage?: string;
  additionalMessage?: string;

  constructor(data: FetcherErrorData) {
    super(data.message);
    this.message = data.message;
    this.statusCode = data.statusCode;
    this.toastMessage = data.toastMessage;
    this.additionalMessage = data.additionalMessage;
  }
}
