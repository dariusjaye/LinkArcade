"use client";

import React, { createContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import firebase, { auth } from "../firebase/firebase";
import { signInWithGoogle as firebaseSignInWithGoogle, logoutUser } from "../firebase/firebaseUtils";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

// User profile interface that extends basic Firebase User data
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  points: number;
  createdAt: number;
  lastLogin: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Initial auth context value
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if Firebase is available
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState<boolean>(
    Boolean(firebase.safeAuth && firebase.safeDb)
  );

  // Fetch or create user profile on user change
  useEffect(() => {
    const fetchOrCreateUserProfile = async () => {
      if (!user || !isFirebaseAvailable || !firebase.safeDb) {
        setUserProfile(null);
        return;
      }

      try {
        const userDocRef = doc(firebase.db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // User exists, get their profile
          const userData = userDoc.data() as UserProfile;
          
          // Update last login time
          await setDoc(userDocRef, { lastLogin: Date.now() }, { merge: true });
          
          setUserProfile(userData);
        } else {
          // Create new user profile
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            points: 0,
            createdAt: Date.now(),
            lastLogin: Date.now(),
          };
          
          // Store user in Firestore
          await setDoc(userDocRef, newUserProfile);
          
          setUserProfile(newUserProfile);
        }
      } catch (error) {
        console.error("Error fetching or creating user profile:", error);
        setError(error instanceof Error ? error : new Error("Failed to fetch user profile"));
      }
    };

    fetchOrCreateUserProfile();
  }, [user, isFirebaseAvailable]);

  // Setup auth state listener
  useEffect(() => {
    // Check if Firebase Auth is available
    if (!isFirebaseAvailable || !firebase.safeAuth) {
      setLoading(false);
      setError(new Error("Firebase authentication is not available"));
      return () => {};
    }

    try {
      const unsubscribe = onAuthStateChanged(firebase.auth, async (authUser) => {
        setUser(authUser);
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setError(error instanceof Error ? error : new Error("Authentication error"));
        setLoading(false);
      });

      // Cleanup subscription
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setError(error instanceof Error ? error : new Error("Failed to initialize authentication"));
      setLoading(false);
      return () => {};
    }
  }, [isFirebaseAvailable]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!isFirebaseAvailable) {
      throw new Error("Firebase authentication is not available");
    }

    try {
      setError(null);
      await firebaseSignInWithGoogle();
      // User state will be updated by the auth state listener
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(error instanceof Error ? error : new Error("Failed to sign in with Google"));
      throw error;
    }
  };

  // Sign out
  const signOutUser = async () => {
    if (!isFirebaseAvailable) {
      throw new Error("Firebase authentication is not available");
    }

    try {
      setError(null);
      await logoutUser();
      // User state will be updated by the auth state listener
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error instanceof Error ? error : new Error("Failed to sign out"));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      loading, 
      error,
      signInWithGoogle, 
      signOut: signOutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
