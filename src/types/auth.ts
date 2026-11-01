export interface User {
  email: string;
  fullName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string | null;
  tokenType?: string;
  expiresIn?: number;
  email: string;
  fullName: string;
}
