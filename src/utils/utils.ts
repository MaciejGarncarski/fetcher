import type { Body, HTTPMethod } from "../types.js";

export function checkCanSendBody(method: HTTPMethod) {
  if (!method) {
    throw new Error("No method provided.");
  }

  if (method === "PUT" || method === "POST" || method === "PATCH") {
    return true;
  }

  return false;
}

export function parseUrl(url: string, baseURL: string) {
  return url.startsWith("http") ? url : baseURL + url;
}

type GetHeadersProps = {
  transformedBody?: Body | null;
  headers?: Record<string, string>;
  instanceHeaders?: Record<string, string> | null;
  headersStrategy: "merge" | "overwrite" | "omit-global";
};

export function getHeaders({
  headers,
  instanceHeaders,
  headersStrategy = "merge",
  transformedBody,
}: GetHeadersProps): Headers {
  const fetchHeaders = new Headers();

  const isMultipartRequest = transformedBody instanceof FormData;

  if (!isMultipartRequest) {
    fetchHeaders.append("Content-Type", "application/json");
  }

  if (headersStrategy === "merge") {
    if (instanceHeaders) {
      Object.entries(instanceHeaders).forEach(([key, value]) => {
        fetchHeaders.append(key, value);
      });
    }

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        fetchHeaders.append(key, value);
      });
    }

    return fetchHeaders;
  }

  if (headersStrategy === "overwrite") {
    Object.entries({
      ...instanceHeaders,
      ...headers,
    }).forEach(([key, value]) => {
      fetchHeaders.append(key, value);
    });

    return fetchHeaders;
  }

  if (headersStrategy === "omit-global") {
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        fetchHeaders.append(key, value);
      });
    }

    return fetchHeaders;
  }

  if (instanceHeaders) {
    Object.entries(instanceHeaders).forEach(([key, value]) => {
      fetchHeaders.append(key, value);
    });
  }

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      fetchHeaders.append(key, value);
    });
  }

  return fetchHeaders;
}

export function getBody(body?: Body, method?: HTTPMethod) {
  if (!method) {
    return null;
  }

  if (method === "POST" || method === "PUT" || method === "PATCH") {
    return body;
  }

  return null;
}

export function transformBody(
  body: Body | null | undefined,
  method: HTTPMethod = "GET"
) {
  if (!checkCanSendBody(method)) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}
