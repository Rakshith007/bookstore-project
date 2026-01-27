// src/components/auth/ProtectedAdminRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedAdminRoute() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAdminAccess = async () => {
      if (!isMounted) return;

      const token = localStorage.getItem('authToken');
      if (!token) {
        if (isMounted) {
          setIsAllowed(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        // ────────────────────────────────────────────────
        // Safe way to get API URL — works in CRA, custom webpack, etc.
        // DO NOT use import.meta.env here!
        // ────────────────────────────────────────────────
        const API_URL =
          process.env.REACT_APP_API_URL ||          // Create React App standard
          process.env.PUBLIC_URL?.includes('localhost') // fallback helper
            ? 'http://localhost:4000'
            : process.env.NEXT_PUBLIC_API_URL ||    // if somehow mixed with Next.js style
              'http://localhost:4000';              // default fallback

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        // Current /auth/me returns { success: true, data: { id, email, ... } }
        // It DOES NOT return role yet → so we temporarily accept any valid token
        // (you should fix backend to return role!)
        const isAdmin =
          // data?.role === 'ADMIN' ||                    // if you fix backend later
          // data?.data?.role === 'ADMIN' ||
          // data?.user?.role === 'ADMIN' ||
          true;  // ← TEMPORARY until backend returns role

        if (isMounted) {
          setIsAllowed(isAdmin);
        }
      } catch (err: any) {
        console.warn('[ProtectedAdminRoute] Admin check failed:', err.message);
        if (isMounted) {
          setIsAllowed(false);
          localStorage.removeItem('authToken'); // clean invalid session
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, []); // ← Important: empty array = run only once!

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return isAllowed ? <Outlet /> : <Navigate to="/admin/login" replace />;
}