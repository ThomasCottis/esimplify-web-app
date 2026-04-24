const BASE = import.meta.env.VITE_API_URL as string

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  get isNotFound() { return this.status === 404 }
  get isConflict()  { return this.status === 409 }
  get isUnauth()    { return this.status === 401 }
}

async function request<T>(
  getToken: () => Promise<string | null>,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const payload = await res.json() as { message?: string }
      message = payload.message ?? message
    } catch { /* ignore parse failure */ }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function createApiClient(getToken: () => Promise<string | null>) {
  return {
    get:    <T>(path: string)              => request<T>(getToken, 'GET',    path),
    post:   <T>(path: string, body: unknown) => request<T>(getToken, 'POST',   path, body),
    put:    <T>(path: string, body: unknown) => request<T>(getToken, 'PUT',    path, body),
    patch:  <T>(path: string, body: unknown) => request<T>(getToken, 'PATCH',  path, body),
    delete: <T>(path: string)              => request<T>(getToken, 'DELETE', path),
  }
}
