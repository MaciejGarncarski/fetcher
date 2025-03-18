export type ApiErrorT = {
  message: string;
  statusCode?: number;
  toastMessage?: string;
  additionalMessage?: string;
};

export class ApiError extends Error {
  statusCode?: number;
  toastMessage?: string;
  additionalMessage?: string;

  constructor(data: ApiErrorT) {
    super(data.message);
    this.message = data.message;
    this.statusCode = data.statusCode;
    this.toastMessage = data.toastMessage;
    this.additionalMessage = data.additionalMessage;
  }
}
