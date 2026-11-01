import { apiFetch, authToken } from './client';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

const USER_KEY = 'finedge_user';

export const authService = {
  /**
   * Log in an existing user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.token) {
        authToken.set(response.token);
      }

      const user: User = {
        email: response.email,
        fullName: response.fullName,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return response;
    } catch (err: unknown) {
      const errorMsg = parseErrorMessage(err);
      throw new Error(errorMsg);
    }
  },

  /**
   * Register a new user account
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.token) {
        authToken.set(response.token);
      }

      const user: User = {
        email: response.email,
        fullName: response.fullName,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return response;
    } catch (err: unknown) {
      const errorMsg = parseErrorMessage(err);
      throw new Error(errorMsg);
    }
  },

  /**
   * Fetch current user profile from server or local session
   */
  async getCurrentUser(): Promise<User | null> {
    const token = authToken.get();
    if (!token) {
      return null;
    }

    // Check cached user in localStorage first for immediate rendering
    const cached = localStorage.getItem(USER_KEY);
    let cachedUser: User | null = null;
    if (cached) {
      try {
        cachedUser = JSON.parse(cached);
      } catch {
        // ignore parse error
      }
    }

    // Validate with backend if connected
    try {
      const response = await apiFetch<AuthResponse>('/auth/me');
      if (response && response.email) {
        const user: User = {
          email: response.email,
          fullName: response.fullName,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
    } catch {
      // If server unreachable or error, use cachedUser if available
      if (cachedUser) return cachedUser;
    }

    return cachedUser;
  },

  /**
   * Log out the current user
   */
  logout(): void {
    authToken.clear();
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get cached user synchronously
   */
  getCachedUser(): User | null {
    const token = authToken.get();
    if (!token) return null;
    const cached = localStorage.getItem(USER_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  },
};

/**
 * Extracts a user-friendly message from an API Error
 */
function parseErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    // Extract JSON payload if embedded in Error string
    const jsonMatch = msg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.message) {
          if (parsed.errors) {
            const fieldErrors = Object.values(parsed.errors).join(', ');
            return `${parsed.message}: ${fieldErrors}`;
          }
          return parsed.message;
        }
      } catch {
        // ignore JSON parse failure
      }
    }
    return msg.replace(/^API Error \[\d+ [^\]]+\]:\s*/, '');
  }
  return 'An unexpected error occurred. Please try again.';
}
