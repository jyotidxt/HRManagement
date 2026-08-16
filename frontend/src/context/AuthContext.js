"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
    API_URL = `${API_URL.replace(/\/$/, '')}/api`;
  }

  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        if (pathname !== '/login') {
          router.replace('/login');
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser({ ...userData, token: storedToken });
          if (pathname === '/login' || pathname === '/') {
            router.replace('/dashboard');
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setUser(null);
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('token');
        setUser(null);
        if (pathname !== '/login') {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [pathname]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data);
      router.replace('/dashboard');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.replace('/login');
  };

  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_URL}${url}`, {
        ...options,
        headers
      });

      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }

      return res;
    } catch (err) {
      console.error('Authenticated fetch error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authenticatedFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
