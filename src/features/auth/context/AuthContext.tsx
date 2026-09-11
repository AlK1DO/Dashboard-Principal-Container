import React, { createContext, useContext, useState, useEffect } from "react";
import { getOrCreateUser } from "../services/authService";
import type { UserProfile } from "../services/authService";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, method: "otp" | "link") => Promise<UserProfile>;
  logout: () => void;
  checkStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const savedEmail = localStorage.getItem("auth_email");
    if (savedEmail) {
      getOrCreateUser(savedEmail).then(profile => {
        setUser(profile);
        setIsLoading(false);
      }).catch(err => {
        console.error("Failed to restore session", err);
        localStorage.removeItem("auth_email");
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // Escuchar cambios en localStorage para sincronizar pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_email") {
        if (e.newValue) {
          getOrCreateUser(e.newValue).then(profile => {
            setUser(profile);
          });
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (email: string, method: "otp" | "link") => {
    const profile = await getOrCreateUser(email);
    setUser(profile);
    localStorage.setItem("auth_email", email.toLowerCase());
    localStorage.setItem("auth_method", method);
    return profile;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_method");
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/";
  };

  const checkStatus = async () => {
    if (user?.email) {
      const profile = await getOrCreateUser(user.email);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, checkStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

