// frontend/src/lib/auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LoginResponse {
  access_token?: string;
  token?: string;
  message?: string;
}

interface SignupResponse {
  access_token?: string;
  token?: string;
  message?: string;
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  const token = data.access_token || data.token;
  if (!token) {
    throw new Error('No token received');
  }

  localStorage.setItem('authToken', token);
  return token;
};

export const signup = async (username: string, email: string, password: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username.trim() || null,  // optional
      email: email.trim(),
      password,
      fullName: '',  // empty for now – will be updated later in profile
    }),
  });

  const data: SignupResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  const token = data.access_token || data.token;

  if (token) {
    localStorage.setItem('authToken', token);
    return token;
  }

  return 'Signup successful';
};

export const logout = () => {
  localStorage.removeItem('authToken');
};

export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('authToken');
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};