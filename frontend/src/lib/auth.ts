// frontend/src/lib/auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ────────────────────────────────────────────────
// Types for email verification
// ────────────────────────────────────────────────
interface LoginResponse {
  access_token?: string;
  token?: string;
  message?: string;
  role?: string;
  user?: {
    id: string | number;
    email: string;
    username?: string | null;
    fullName?: string;
    phoneNumber?: string | null;
    emailVerified?: boolean; // NEW
  };
}

interface SignupResponse {
  access_token?: string;
  token?: string;
  message?: string;
  role?: string;
  emailVerified?: boolean; // NEW
  requiresVerification?: boolean; // NEW
  user?: {
    id: string | number;
    email: string;
    username?: string | null;
    fullName?: string;
    phoneNumber?: string | null;
    emailVerified?: boolean;
  };
}

interface VerificationResponse {
  success: boolean;
  message: string;
  email?: string;
}

// ────────────────────────────────────────────────
// Signup – Updated for email verification
// ────────────────────────────────────────────────
export const signup = async (
  username: string,
  email: string,
  password: string,
  fullName?: string
): Promise<SignupResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username.trim() || null,
      email: email.trim(),
      password,
      fullName: fullName || username.trim() || '',
    }),
  });

  const data: SignupResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  // If backend returns requiresVerification flag
  if (data.requiresVerification) {
    return {
      ...data,
      message: data.message || 'Please check your email to verify your account',
    };
  }

  // If token is returned (for immediate login after verification)
  const token = data.access_token || data.token;
  if (token) {
    localStorage.setItem('authToken', token);
    if (data.role) {
      localStorage.setItem('userRole', data.role);
    }
    return data;
  }

  return { 
    message: data.message || 'Signup successful. Please check your email.',
    requiresVerification: true 
  };
};

// ────────────────────────────────────────────────
// NEW: Verify Email Token
// ────────────────────────────────────────────────
export const verifyEmail = async (token: string): Promise<VerificationResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Verification failed');
  }

  return data;
};

// ────────────────────────────────────────────────
// NEW: Resend Verification Email
// ────────────────────────────────────────────────
export const resendVerificationEmail = async (email: string): Promise<VerificationResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to resend verification email');
  }

  return data;
};

// ────────────────────────────────────────────────
// Login – Updated to check email verification
// ────────────────────────────────────────────────
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    // Check if error is due to unverified email
    if (data.message?.toLowerCase().includes('verify') || 
        data.message?.toLowerCase().includes('email not verified')) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    throw new Error(data.message || 'Login failed');
  }

  const token = data.access_token || data.token;
  if (!token) {
    throw new Error('No token received from server');
  }

  localStorage.setItem('authToken', token);

  // Store role if present
  if (data.role) {
    localStorage.setItem('userRole', data.role);
  }

  // Store email verification status
  if (data.user?.emailVerified !== undefined) {
    localStorage.setItem('emailVerified', data.user.emailVerified.toString());
  }

  return data;
};

// ────────────────────────────────────────────────
// Check if email is verified
// ────────────────────────────────────────────────
export const isEmailVerified = (): boolean => {
  const verified = localStorage.getItem('emailVerified');
  return verified === 'true';
};

// ────────────────────────────────────────────────
// Existing functions (keep as is)
// ────────────────────────────────────────────────
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('emailVerified');
};

export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('authToken');
};

export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getUserRole = (): string | null => {
  return localStorage.getItem('userRole');
};

export const setUserRole = (role: string) => {
  localStorage.setItem('userRole', role);
};