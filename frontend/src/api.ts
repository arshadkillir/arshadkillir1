// ✅ Use environment variable for backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface ApiErrorResponse {
  error?: string;
  issues?: Record<string, string[] | undefined>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public issues?: Record<string, string[] | undefined>
  ) {
    super(message);
  }
}

async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const token = localStorage.getItem('token');

  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorIssues: Record<string, string[] | undefined> | undefined;

    try {
      const errorData = (await response.json()) as ApiErrorResponse;
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
      errorIssues = errorData.issues;
    } catch {}

    throw new ApiError(errorMessage, response.status, errorIssues);
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
}

export default apiFetch;
