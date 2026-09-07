const API_URL =
  process.env.BACKEND_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

const cache = new Map<string, { data: unknown; expires: number }>();

export async function serverFetch<T = any>(
  endpoint: string,
  revalidate = 3600
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const cacheKey = url;

  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data as ApiResponse<T>;
  }

  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return { success: false, message: `Request failed: ${res.status}` };
    }

    const data = (await res.json()) as ApiResponse<T>;
    cache.set(cacheKey, {
      data,
      expires: Date.now() + revalidate * 1000,
    });
    return data;
  } catch {
    return { success: false, message: "Failed to connect to server" };
  }
}

export async function serverGetPublicJournals<T = any[]>(revalidate = 3600) {
  return serverFetch<T>("/api/public/journals", revalidate);
}

export async function serverGetPublicArticles<T = any[]>(revalidate = 3600) {
  return serverFetch<T>("/api/public/articles", revalidate);
}

export async function serverGetPublicJournalBySlug<T = any>(
  slug: string,
  revalidate = 3600
) {
  return serverFetch<T>(`/api/public/journals/${slug}`, revalidate);
}

export async function serverGetPublicArticleById<T = any>(
  id: string,
  revalidate = 3600
) {
  return serverFetch<T>(`/api/public/articles/${id}`, revalidate);
}

export async function serverGetPublicVolumeById<T = any>(
  id: string,
  revalidate = 3600
) {
  return serverFetch<T>(`/api/public/volumes/${id}`, revalidate);
}

export async function serverGetPublicIssueById<T = any>(
  id: string,
  revalidate = 3600
) {
  return serverFetch<T>(`/api/public/issues/${id}`, revalidate);
}
