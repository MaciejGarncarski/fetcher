import { z } from "zod";
import {
  getHeaders,
  getBody,
  parseUrl,
  transformBody,
} from "../utils/utils.js";
import { ApiError } from "./api-error.js";

import type {
  CreateFetcherOptions,
  FetcherFunction,
  FetcherOptions,
  FetcherReturn,
  HTTPMethod,
  ResponseType,
  TransformedData,
} from "../types.js";

async function fetcher<
  TMethod extends HTTPMethod,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends z.ZodType | undefined = undefined
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema>,
  instanceOptions: CreateFetcherOptions
) {
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

    const transformedDataWithType =
      transformedData as TransformedData<ResponseType>;

    if (schema) {
      const parsed = schema.safeParse(transformedDataWithType);

      if (!parsed.success) {
        throw new ApiError({
          statusCode: response.status,
          message: "parsing failed",
        });
      }

      return parsed.data as FetcherReturn<TResponseType, TSchema>;
    }

    return transformedDataWithType as FetcherReturn<TResponseType, TSchema>;
  } catch (error) {
    if (throwOnError) {
      throw error;
    }

    return null as FetcherReturn<TResponseType, TSchema>;
  }
}

export const createFetcherInstance = (
  fetcherInstanceOptions?: CreateFetcherOptions
): FetcherFunction => {
  const { apiErrorSchema, baseURL = "" } = fetcherInstanceOptions || {};

  return (fetcherConfig) => fetcher(fetcherConfig, { baseURL, apiErrorSchema });
};
