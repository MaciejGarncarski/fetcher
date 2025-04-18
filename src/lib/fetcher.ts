import { unknown, z } from "zod";
import {
  getHeaders,
  getBody,
  parseUrl,
  transformBody,
} from "../utils/utils.js";
import { FetcherError } from "./fetcher-error.js";

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
  TError extends unknown,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends z.ZodType | undefined = undefined
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema>,
  instanceOptions: CreateFetcherOptions<TError>
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
    onErrorThrown,
  } = fetcherOptions;

  const { baseURL = "" } = instanceOptions;

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
      throw responseJson;
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
        throw new FetcherError({
          statusCode: response.status,
          message: "parsing failed",
        });
      }

      return parsed.data as FetcherReturn<TResponseType, TSchema>;
    }

    return transformedDataWithType as FetcherReturn<TResponseType, TSchema>;
  } catch (error) {
    if (throwOnError) {
      if (instanceOptions.onErrorThrown) {
        instanceOptions.onErrorThrown(error as TError);
      }

      if (onErrorThrown) {
        onErrorThrown(error);
      }

      throw error;
    }

    return null as FetcherReturn<TResponseType, TSchema>;
  }
}

export const createFetcherInstance = <TError extends unknown>(
  fetcherInstanceOptions?: CreateFetcherOptions<TError>
): FetcherFunction => {
  const { baseURL = "", onErrorThrown } = fetcherInstanceOptions || {};

  return (fetcherConfig) => fetcher(fetcherConfig, { baseURL, onErrorThrown });
};
