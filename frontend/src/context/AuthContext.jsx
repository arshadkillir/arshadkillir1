import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // You may need to install this: npm install jwt-decode

const AuthContext = createContext(null);

// Helper to get user data from token
const getUserFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("authToken");
      return null;
    }
    return { ...decoded, id: decoded.sub }; // Add id from sub claim
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUserFromToken());
  const [loading, setLoading] = useState(false);

  const login = async (creds) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/login", { // Assuming backend is on port 3001
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const { token } = await response.json();
      localStorage.setItem("authToken", token);
      setUser(getUserFromToken());
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw to be caught in the UI
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { // This function provides access to the auth context
  return useContext(AuthContext);
}