export const API: string = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

export async function api(path: string, opts: RequestInit & { token?: string } = {}) {
  const { token, ...rest } = opts;
  const res = await fetch(API + path, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, details: data.details });
  return data;
}
