const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zyrstar.com/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const csrfToken = getCookie("zyrstar_csrf");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      // ignore parse failure
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface MetricBreakdown {
  name: string;
  label: string;
  score: number;
  description: string;
}

export interface DetectionResult {
  ai_probability: number;
  verdict: string;
  confidence: string;
  metrics: MetricBreakdown[];
  word_count: number;
  sentence_count: number;
}

export interface HumanizeResult {
  original_text: string;
  humanized_text: string;
  humanization_score: number;
  detection_before: DetectionResult;
  detection_after: DetectionResult;
  changes_made: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  is_verified: boolean;
  words_used_this_period: number;
  words_quota: number;
}

export const api = {
  detect: (text: string) =>
    request<DetectionResult>("/detect", { method: "POST", body: JSON.stringify({ text }) }),

  humanize: (text: string, tone: string, strength: string) =>
    request<HumanizeResult>("/humanize", {
      method: "POST",
      body: JSON.stringify({ text, tone, strength }),
    }),

  register: (email: string, password: string, full_name: string) =>
    request<{ access_token: string; user: UserProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<UserProfile>("/auth/me"),
};
