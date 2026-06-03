"use client";

import { useState, useEffect } from "react";
import { authService } from "@/src/services/auth";

interface AuthActionResult {
  success: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getSession();
      setIsLoggedIn(!!user);
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    const { error } = await authService.login(email, password);
    if (error) {
      return { success: false, error: error.message };
    } else {
      setIsLoggedIn(true);
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return { success: true, error: null };
    }
  };

  const logout = async (): Promise<AuthActionResult> => {
    const { error } = await authService.logout();
    if (error) {
      return { success: false, error: error.message };
    }

    setIsLoggedIn(false);
    window.location.reload();
    return { success: true, error: null };
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return { isLoggedIn, loading, login, logout, checkAuthStatus };
};
