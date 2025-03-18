type HTTPMethod = "PUT" | "POST" | "PATCH" | "DELETE" | "GET";

export function canSendBody(method: HTTPMethod) {
  if (method === "PUT" || method === "POST" || method === "PATCH") {
    return true;
  }

  return false;
}

export function parseUrl(url: string, baseAPIUrl: string) {
  return url.startsWith("http") ? url : baseAPIUrl + url;
}
