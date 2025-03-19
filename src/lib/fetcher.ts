import { z } from "zod";
import {
  canSendBody,
  getHeaders,
  getBody,
  parseUrl,
  type Body,
  type HTTPMethod,
  type ResponseType,
  transformBody,
} from "../utils/utils.js";
import { ApiError } from "./api-error.js";

export type FetcherOptions<
  TMethod extends HTTPMethod = "GET",
  TResponseType extends ResponseType | undefined = "json",
  TSchema extends z.ZodSchema = z.ZodSchema
> = {
  responseType?: TResponseType;
  method: TMethod;
  url: string;
  body?: TMethod extends "POST" | "PUT" | "PATCH" ? Body : never;
  schema?: TResponseType extends "arrayBuffer" ? never : TSchema;
  throwOnError?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

type InferResponseType<TResponseType extends ResponseType | undefined> =
  TResponseType extends "arrayBuffer"
    ? ArrayBuffer
    : TResponseType extends "text"
    ? string
    : Record<string, any>;

type ReturnType<
  TResponseType extends ResponseType | undefined,
  TSchema extends z.ZodSchema | undefined
> = TSchema extends z.ZodSchema
  ? TResponseType extends "arrayBuffer"
    ? never
    : z.infer<TSchema>
  : InferResponseType<TResponseType>;

export type CreateFetcherOptions = {
  baseURL?: string;
  apiErrorSchema?: z.ZodSchema;
};

type FetcherFunction = <
  TMethod extends HTTPMethod = HTTPMethod,
  TResponseType extends ResponseType | undefined = ResponseType,
  TSchema extends z.ZodSchema = z.ZodSchema
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema>
) => Promise<ReturnType<TResponseType, TSchema> | null>;

const fetcher = async <
  TMethod extends HTTPMethod = "GET",
  TResponseType extends ResponseType | undefined = "json",
  TSchema extends z.ZodSchema = z.ZodSchema
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema>,
  instanceOptions: CreateFetcherOptions
): Promise<ReturnType<TResponseType, TSchema> | null> => {
  const {
    body,
    method,
    schema,
    url,
    throwOnError = false,
    headers,
    signal,
    responseType = "json",
  } = fetcherOptions;

  const { apiErrorSchema, baseURL = "" } = instanceOptions;

  try {
    const fetchBody = getBody(body, method);
    const transformedFetchBody = transformBody(body, method);
    const fetchHeaders = getHeaders(fetchBody, headers);

    const response = await fetch(parseUrl(url, baseURL), {
      body: transformedFetchBody,
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
      return transformedData as ReturnType<TResponseType, TSchema>;
    }

    const parsed = schema.safeParse(transformedData);

    if (!parsed.success) {
      throw new ApiError({
        statusCode: response.status,
        message: "parsing failed",
      });
    }

    return parsed.data as ReturnType<TResponseType, TSchema>;
  } catch (error) {
    if (throwOnError) {
      throw error;
    }

    return null;
  }
};

export const createFetcherInstance = ({
  baseURL = "",
  apiErrorSchema,
}: CreateFetcherOptions): FetcherFunction => {
  return (fetcherConfig) => fetcher(fetcherConfig, { baseURL, apiErrorSchema });
};
