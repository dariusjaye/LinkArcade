import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Define our firebaseConfig
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Create a client-side only wrapper for Firebase
// This prevents issues during SSR and build
class FirebaseWrapper {
  private _app: FirebaseApp | null = null;
  private _auth: Auth | null = null;
  private _db: Firestore | null = null;
  private _storage: FirebaseStorage | null = null;

  // Initialize Firebase if we're in a browser environment
  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this._app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        this._auth = getAuth(this._app);
        this._db = getFirestore(this._app);
        this._storage = getStorage(this._app);
      } catch (error) {
        console.error("Firebase initialization error:", error);
        // Keep the instances as null if there's an error
      }
    }
  }

  // Getters with proper type assertions and checks
  get app(): FirebaseApp {
    if (!this._app) {
      throw new Error("Firebase app not initialized");
    }
    return this._app;
  }

  get auth(): Auth {
    if (!this._auth) {
      throw new Error("Firebase auth not initialized");
    }
    return this._auth;
  }

  get db(): Firestore {
    if (!this._db) {
      throw new Error("Firebase firestore not initialized");
    }
    return this._db;
  }

  get storage(): FirebaseStorage {
    if (!this._storage) {
      throw new Error("Firebase storage not initialized");
    }
    return this._storage;
  }

  // Safe getters that don't throw errors - useful for SSR
  get safeApp(): FirebaseApp | null {
    return this._app;
  }

  get safeAuth(): Auth | null {
    return this._auth;
  }

  get safeDb(): Firestore | null {
    return this._db;
  }

  get safeStorage(): FirebaseStorage | null {
    return this._storage;
  }
}

// Create and export a single instance
const firebase = new FirebaseWrapper();

export const app = firebase.safeApp;
export const auth = firebase.safeAuth;
export const db = firebase.safeDb;
export const storage = firebase.safeStorage;

// Also export the wrapper for components that need to safely check
export default firebase;
