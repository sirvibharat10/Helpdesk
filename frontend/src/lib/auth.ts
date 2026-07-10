import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
  token: string | null;
  user: any | null;
  isLoggedIn: boolean;
  logout: () => void;
  setAuth: (token: string, user: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [user, setUser] = useState<any | null>(() => {
    const userStr = localStorage.getItem("auth_user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  const setAuth = (newToken: string, newUser: any) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        token,
        user,
        isLoggedIn: !!token,
        logout,
        setAuth,
      },
    },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
    return user.role === "ADMIN";
  } catch {
    return false;
  }
};

export const isAgent = () => {
  try {
    const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
    return user.role === "AGENT";
  } catch {
    return false;
  }
};
