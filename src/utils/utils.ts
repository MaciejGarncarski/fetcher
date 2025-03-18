type HTTPMethod = "PUT" | "POST" | "PATCH" | "DELETE" | "GET";

export function canSendBody(method: HTTPMethod) {
  if (!method) {
    throw new Error("No method provided.");
  }

  if (method === "PUT" || method === "POST" || method === "PATCH") {
    return true;
  }

  return false;
}

export function parseUrl(url: string, baseAPIUrl: string) {
  if (!url) {
    throw new Error("No url provided.");
  }

  if (!baseAPIUrl) {
    throw new Error("No baseAPIUrl provided.");
  }

  return url.startsWith("http") ? url : baseAPIUrl + url;
}
