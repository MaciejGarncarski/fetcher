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
