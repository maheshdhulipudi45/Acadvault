export const API_BASE_URL = "http://localhost:5000/api";

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== "undefined" ? localStorage.getItem("acadvault_token") : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    let errMsg = "API request failed";
    try {
      const errData = await response.json();
      errMsg = errData.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  
  return response.json() as Promise<T>;
}
