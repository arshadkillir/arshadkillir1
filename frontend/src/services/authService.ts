import apiFetch from "@/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: any; // Replace with your User type if you have one
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return data!;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return data!;
  },

  async getCurrentUser() {
    return apiFetch("/auth/me", {
      method: "GET",
    });
  },

  logout() {
    localStorage.removeItem("token");
  },
};
