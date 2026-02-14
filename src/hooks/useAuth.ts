"use client";

import { useState, useEffect } from "react";
import { authService } from "@/src/services/auth";

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

  const login = async (email: string, password: string) => {
    const { error } = await authService.login(email, password);
    if (error) {
      alert("Authentication failed: " + error.message);
      return { success: false };
    } else {
      setIsLoggedIn(true);
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return { success: true };
    }
  };

  const logout = async () => {
    const { error } = await authService.logout();
    if (error) {
      alert("Logout failed: " + error.message);
    } else {
      setIsLoggedIn(false);
      window.location.reload();
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return { isLoggedIn, loading, login, logout, checkAuthStatus };
};
