"use client";

import React, { createContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Initial auth context value
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create user profile on user change
  useEffect(() => {
    const fetchOrCreateUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
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
      }
    };

    fetchOrCreateUserProfile();
  }, [user]);

  // Setup auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      await firebaseSignInWithGoogle();
      // User state will be updated by the auth state listener
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await logoutUser();
      // User state will be updated by the auth state listener
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      loading, 
      signInWithGoogle, 
      signOut: signOutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
