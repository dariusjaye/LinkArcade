"use client";

import React, { createContext, useEffect, useState } from "react";
import { User } from "firebase/auth";

// Create a mock User type matching Firebase User structure
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Initial auth context value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate auth loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock Google sign in
  const signInWithGoogle = async () => {
    // Create a mock user
    const mockUser: MockUser = {
      uid: "mock-user-123",
      email: "user@example.com",
      displayName: "Demo User",
      photoURL: "https://ui-avatars.com/api/?name=Demo+User&background=random",
    };
    
    setUser(mockUser);
    
    // Store in local storage to persist between refreshes
    localStorage.setItem("mockUser", JSON.stringify(mockUser));
  };

  // Check for existing user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("mockUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Sign out
  const signOutUser = async () => {
    setUser(null);
    localStorage.removeItem("mockUser");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle, 
      signOut: signOutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
