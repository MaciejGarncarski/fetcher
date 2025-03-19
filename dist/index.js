var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/utils/utils.ts
function canSendBody(method) {
  if (!method) {
    throw new Error("No method provided.");
  }
  if (method === "PUT" || method === "POST" || method === "PATCH") {
    return true;
  }
  return false;
}
function parseUrl(url, baseURL) {
  return url.startsWith("http") ? url : baseURL + url;
}

// src/lib/api-error.ts
var ApiError = class extends Error {
  constructor(data) {
    super(data.message);
    __publicField(this, "statusCode");
    __publicField(this, "toastMessage");
    __publicField(this, "additionalMessage");
    this.message = data.message;
    this.statusCode = data.statusCode;
    this.toastMessage = data.toastMessage;
    this.additionalMessage = data.additionalMessage;
  }
};

// src/lib/fetcher.ts
var fetcher = async ({
  body,
  method,
  responseType = "json",
  schema,
  url,
  throwOnError = false,
  headers,
  signal,
  apiErrorSchema,
  baseURL = ""
}) => {
  try {
    const transformedBody = method === "POST" ? body : method === "PUT" ? body : method === "PATCH" ? body : null;
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
      body: canSendBody(method) ? transformedBody instanceof FormData ? transformedBody : JSON.stringify(transformedBody) : void 0,
      credentials: "include",
      signal,
      headers: fetchHeaders,
      method
    });
    if (!response.ok) {
      const responseJson = await response.json();
      if (apiErrorSchema) {
        const parsedResponse = apiErrorSchema.safeParse(responseJson);
        if (!parsedResponse.success) {
          throw new ApiError({
            statusCode: response.status,
            message: "error parsing failed"
          });
        }
        if (parsedResponse.data.toastMessage) {
          throw new ApiError({
            message: "request failed",
            statusCode: response.status,
            toastMessage: parsedResponse.data.toastMessage
          });
        }
        if (parsedResponse.data.message) {
          throw new ApiError({
            statusCode: response.status,
            message: parsedResponse.data.message
          });
        }
      }
      throw new ApiError({
        statusCode: response.status,
        message: "request failed"
      });
    }
    const transformedData = responseType === "arrayBuffer" ? await response.arrayBuffer() : responseType === "text" ? await response.text() : responseType === "json" ? await response.json() : await response.json();
    if (!schema) {
      return transformedData;
    }
    const parsed = schema.safeParse(transformedData);
    if (!parsed.success) {
      throw new ApiError({
        statusCode: response.status,
        message: "parsing failed"
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
var createFetcherInstance = ({
  baseURL = "",
  apiErrorSchema
}) => {
  const fetcherInstance = fetcher.bind({
    baseURL,
    apiErrorSchema
  });
  return fetcherInstance;
};
export {
  ApiError,
  createFetcherInstance
};
//# sourceMappingURL=index.js.map