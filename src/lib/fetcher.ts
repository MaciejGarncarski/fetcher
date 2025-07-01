import * as z from "zod/v4/mini";
z.config(z.locales.en());

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
    headerMergeStrategy = "merge",
  } = fetcherOptions;

  const { baseURL = "" } = instanceOptions;

  try {
    const fetchBody = getBody(body, method);
    const transformedFetchBody = transformBody(fetchBody, method);
    const fetchHeaders = getHeaders({
      headers,
      instanceHeaders: instanceOptions.headers,
      headerMergeStrategy,
    });

    const response = await fetch(parseUrl(url, baseURL), {
      body: transformedFetchBody,
      credentials: "include",
      signal: signal,
      headers: fetchHeaders,
      method: method,
    });

    if (!response.ok) {
      const responseHeaders = Object.fromEntries(response.headers.entries());

      let responseData = null;

      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      throw new FetcherError({
        errorMessage: "Request failed",
        data: responseData,
        headers: responseHeaders,
        statusCode: response.status,
      });
    }

    const responseHeaders = Object.fromEntries(response.headers.entries());

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
          errorMessage: `Parsing failed: ${errorMessages.join(". ")}`,
          headers: responseHeaders,
          data: transformedDataWithType,
          statusCode: response.status,
        });
      }

      return {
        statusCode: response.status,
        headers: responseHeaders,
        data: parsed.data,
        isError: false,
      } as FetcherReturn<TResponseType, TSchema>;
    }

    return {
      statusCode: response.status,
      headers: responseHeaders,
      data: transformedDataWithType,
      isError: false,
    } as FetcherReturn<TResponseType, TSchema>;
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

    if (error instanceof FetcherError) {
      return {
        data: error.data,
        message: error.message,
        statusCode: error.statusCode,
        headers: error.headers,
        isError: true,
      } as FetcherReturn<TResponseType, TSchema>;
    }

    return {
      data: null,
      isError: true,
    } as FetcherReturn<TResponseType, TSchema>;
  }
}

export const createFetcherInstance = <TError extends unknown>(
  fetcherInstanceOptions?: FetcherInstanceOptions<TError>
): FetcherFunction => {
  const {
    baseURL = "",
    onErrorThrown,
    throwOnError = false,
    headers,
  } = fetcherInstanceOptions || {};

  return (fetcherConfig) =>
    fetcher(fetcherConfig, { baseURL, onErrorThrown, throwOnError, headers });
};
