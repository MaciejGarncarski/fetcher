import { z } from "zod/v4";
import {
  getHeaders,
  getBody,
  parseUrl,
  transformBody,
} from "../utils/utils.js";
import { FetcherError } from "./fetcher-error.js";

import type {
  FetcherInstanceOptions,
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
  TSchema extends z.core.$ZodType | undefined = undefined
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema>,
  instanceOptions: FetcherInstanceOptions<TError>
) {
  const {
    body,
    method,
    schema,
    url,
    throwOnError = instanceOptions.throwOnError || false,
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
      const parsed = z.core.safeParse(schema, transformedDataWithType);

      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((issue) => {
          return `Field '${issue.path.join(
            "."
          )}' ${issue.message.toLowerCase()}`;
        });

        throw new FetcherError({
          additionalMessage: errorMessages.toString(),
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
  fetcherInstanceOptions?: FetcherInstanceOptions<TError>
): FetcherFunction => {
  const {
    baseURL = "",
    onErrorThrown,
    throwOnError = false,
  } = fetcherInstanceOptions || {};

  return (fetcherConfig) =>
    fetcher(fetcherConfig, { baseURL, onErrorThrown, throwOnError });
};
