import { z } from "zod";
import { canSendBody, parseUrl } from "../utils/utils.js";
import { ApiError } from "./api-error.js";

type ResponseType = "json" | "text" | "arrayBuffer";
type HttpMethod = "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
type Body = FormData | Record<string, unknown>;

export type FetcherProperties<
  R extends ResponseType | undefined = "json",
  M extends HttpMethod = "GET",
  S extends z.ZodTypeAny = z.ZodTypeAny
> = {
  responseType?: R;
  method: M;
  url: string;
  body?: M extends "POST"
    ? Body
    : M extends "PUT"
    ? Body
    : M extends "PATCH"
    ? Body
    : never;
  schema?: R extends "arrayBuffer" ? never : S;
  throwOnError?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

type ReturnType<R extends ResponseType | undefined, S extends z.ZodTypeAny> =
  | (R extends "arrayBuffer"
      ? ArrayBuffer
      : R extends "text"
      ? S extends undefined
        ? string
        : z.infer<S>
      : S extends undefined
      ? Record<string, unknown>
      : z.infer<S>)
  | never
  | null;

export type CreateFetcherProperties = {
  baseURL?: string;
  apiErrorSchema?: z.ZodSchema;
};

export const createFetcherInstance = ({
  baseURL = "",
  apiErrorSchema,
}: CreateFetcherProperties) => {
  return async <
    R extends ResponseType | undefined = "json",
    M extends HttpMethod = "GET",
    S extends z.ZodTypeAny = z.ZodTypeAny
  >({
    body,
    method,
    responseType = "json",
    schema,
    url,
    throwOnError = false,
    headers,
    signal,
  }: FetcherProperties<R, M, S>): Promise<ReturnType<R, S>> => {
    try {
      const transformedBody =
        method === "POST"
          ? body
          : method === "PUT"
          ? body
          : method === "PATCH"
          ? body
          : null;

      const fetchHeaders = new Headers();

      const isMultipartRequest = transformedBody instanceof FormData;

      if (!isMultipartRequest) {
        fetchHeaders.append("Content-Type", "application/json");
      }

      if (headers) {
        Object.entries(headers).forEach(([key, value]) => {
          fetchHeaders.append(key, value);
        });
      }

      const response = await fetch(parseUrl(url, baseURL), {
        body: canSendBody(method)
          ? transformedBody instanceof FormData
            ? transformedBody
            : JSON.stringify(transformedBody)
          : undefined,
        credentials: "include",
        signal: signal,
        headers: fetchHeaders,
        method: method,
      });

      if (!response.ok) {
        const responseJson = await response.json();

        if (apiErrorSchema) {
          const parsedResponse = apiErrorSchema.safeParse(responseJson);
          if (!parsedResponse.success) {
            throw new ApiError({
              statusCode: response.status,
              message: "error parsing failed",
            });
          }

          if (parsedResponse.data.toastMessage) {
            throw new ApiError({
              message: "request failed",
              statusCode: response.status,
              toastMessage: parsedResponse.data.toastMessage,
            });
          }

          if (parsedResponse.data.message) {
            throw new ApiError({
              statusCode: response.status,
              message: parsedResponse.data.message,
            });
          }
        }

        throw new ApiError({
          statusCode: response.status,
          message: "request failed",
        });
      }

      const transformedData =
        responseType === "arrayBuffer"
          ? await response.arrayBuffer()
          : responseType === "text"
          ? await response.text()
          : responseType === "json"
          ? await response.json()
          : await response.json();

      if (!schema) {
        return transformedData as ReturnType<R, S>;
      }

      const parsed = schema.safeParse(transformedData);

      if (!parsed.success) {
        throw new ApiError({
          statusCode: response.status,
          message: "parsing failed",
        });
      }

      return parsed.data;
    } catch (error) {
      if (throwOnError) {
        throw error;
      }

      return null;
    }
  };
};
