import type { StandardSchemaV1 } from "@standard-schema/spec";

import {
  getHeaders,
  getBody,
  parseUrl,
  transformBody,
} from "../utils/utils.js";
import { FetcherError } from "./fetcher-error.js";

import type {
  FetcherInstanceOptions,
  FetcherOptions,
  FetcherReturn,
  HTTPMethod,
  ResponseType,
  TransformedData,
} from "../types.js";
import { standardValidate } from "../utils/standard-validate.js";

async function fetcher<
  TMethod extends HTTPMethod,
  TError extends unknown,
  TResponseType extends ResponseType | undefined = undefined,
  TSchema extends StandardSchemaV1 | undefined = undefined
>(
  fetcherOptions: FetcherOptions<TMethod, TResponseType, TSchema> & {
    [key: string]: unknown;
  },
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
    headersStrategy = "merge",
    cache = "default",
    credentials = "include",
    keepalive = false,
    mode = "cors",
    priority = "auto",
    redirect = "follow",
    referrer = "about:client",
    referrerPolicy,
    integrity = "",
    ...other
  } = fetcherOptions;

  const { baseURL = "" } = instanceOptions;

  try {
    const fetchBody = getBody(body, method);
    const transformedFetchBody = transformBody(fetchBody, method);
    const fetchHeaders = getHeaders({
      headers,
      instanceHeaders: instanceOptions.headers,
      headersStrategy,
    });

    const response = await fetch(parseUrl(url, baseURL), {
      body: transformedFetchBody,
      credentials: credentials,
      keepalive: keepalive,
      signal: signal,
      headers: fetchHeaders,
      method: method,
      cache: cache,
      mode: mode,
      priority: priority,
      redirect: redirect,
      referrer: referrer,
      referrerPolicy: referrerPolicy,
      integrity: integrity,
      ...other,
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
      const parsed = await standardValidate(schema, transformedDataWithType);

      if (!parsed.success) {
        throw new FetcherError({
          errorMessage: `Parsing failed! ${JSON.stringify(parsed.issues)}`,
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
        errorMessage: error.errorMessage,
        statusCode: error.statusCode,
        headers: error.headers,
        isError: true,
      } as FetcherReturn<TResponseType, TSchema>;
    }

    return {
      data: null,
      errorMessage:
        error instanceof Error ? `Error: ${error.message}` : "Unknown error",
      isError: true,
    } as FetcherReturn<TResponseType, TSchema>;
  }
}

/**
 * Configuration options for creating a fetcher instance.
 *
 * @template T The type of error passed to the onErrorThrown callback.
 *
 * @param onErrorThrown Optional callback triggered when an error occurs. Receives the typed error object.
 * @param baseURL Optional base URL to prepend to all request URLs.
 * @param throwOnError If true, non-2xx responses will throw an error automatically.
 * @param headers Optional default headers applied to all requests made by the fetcher instance.
 */
export const createFetcherInstance = <TError extends unknown>(
  fetcherInstanceOptions?: FetcherInstanceOptions<TError>
) => {
  const {
    baseURL = "",
    onErrorThrown,
    throwOnError = false,
    headers,
  } = fetcherInstanceOptions || {};

  /**
   * The fetcher function used to make typed HTTP requests.
   *
   * @template TMethod HTTP method (e.g., "GET", "POST")
   * @template TResponseType Expected response type ("json", "arrayBuffer", etc.)
   * @template TSchema Schema to validate the response against
   *
   * @param fetcherOptions Options for the request:
   * @param fetcherOptions.method The HTTP method
   * @param fetcherOptions.url The endpoint
   * @param fetcherOptions.body Request body (for POST/PUT/PATCH)
   * @param fetcherOptions.responseType Type of response to parse
   * @param fetcherOptions.schema Optional Zod or compatible schema for validation
   * @param fetcherOptions.throwOnError Whether to throw on non-2xx
   * @param fetcherOptions.signal Optional AbortSignal
   * @param fetcherOptions.onErrorThrown Callback for error
   * @param fetcherOptions.headers Optional headers
   * @param fetcherOptions.headersStrategy "merge" or "overwrite" or "omit-global"
   * @param fetcherOptions.cache "default" or "no-store" or "no-cache" or "force-cache" or "only-if-cached"
   * @param fetcherOptions.credentials "include" or "omit" or "same-origin"
   * @param fetcherOptions.keepalive Whether to keep the connection alive
   * @param fetcherOptions.mode "cors" or "no-cors" or "same-origin"
   * @param fetcherOptions.priority "auto" or "high" or "low"
   * @param fetcherOptions.redirect "follow" or "error" or "manual"
   * @param fetcherOptions.referrer "about:client" or "client" or "no-referrer"
   * @param fetcherOptions.referrerPolicy "no-referrer" or "no-referrer-when-downgrade" or "origin" or "origin-when-cross-origin" or "same-origin" or "strict-origin" or "strict-origin-when-cross-origin" or "unsafe-url"
   * @param fetcherOptions.integrity Optional subresource integrity value
   *
   * @returns A Promise resolving to typed response data
   */
  return <
    TMethod extends HTTPMethod,
    TResponseType extends ResponseType | undefined = undefined,
    TSchema extends StandardSchemaV1 | undefined = undefined
  >(
    fetcherConfig: FetcherOptions<TMethod, TResponseType, TSchema> & {
      [key: string]: unknown;
    }
  ) => {
    const fetcherFn = fetcher(fetcherConfig, {
      baseURL,
      onErrorThrown,
      throwOnError,
      headers,
    });

    return fetcherFn;
  };
};
