import firebase, { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
  Auth,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  onSnapshot,
  writeBatch,
  Firestore,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from "firebase/storage";

// Helper function to get safe Auth instance
const getAuthInstance = (): Auth => {
  if (!firebase.safeAuth) {
    throw new Error("Firebase Auth is not initialized");
  }
  return firebase.auth; // This will use the non-null getter
};

// Helper function to get safe Firestore instance
const getFirestoreInstance = (): Firestore => {
  if (!firebase.safeDb) {
    throw new Error("Firebase Firestore is not initialized");
  }
  return firebase.db; // This will use the non-null getter
};

// Helper function to get safe Storage instance
const getStorageInstance = (): FirebaseStorage => {
  if (!firebase.safeStorage) {
    throw new Error("Firebase Storage is not initialized");
  }
  return firebase.storage; // This will use the non-null getter
};

// Auth functions
export const logoutUser = async () => {
  const authInstance = getAuthInstance();
  return signOut(authInstance);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const authInstance = getAuthInstance();
  
  try {
    const result = await signInWithPopup(authInstance, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const authInstance = getAuthInstance();
  
  try {
    const { user } = await createUserWithEmailAndPassword(authInstance, email, password);
    await updateProfile(user, { displayName });
    return user;
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  const authInstance = getAuthInstance();
  
  try {
    const result = await firebaseSignInWithEmailAndPassword(authInstance, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email and password", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  const authInstance = getAuthInstance();
  
  try {
    await sendPasswordResetEmail(authInstance, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = async <T extends {}>(collectionName: string, data: T) => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    const docRef = await addDoc(collection(firestoreInstance, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}`, error);
    throw error;
  }
};

export const setDocument = async <T extends {}>(collectionName: string, id: string, data: T) => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    await setDoc(doc(firestoreInstance, collectionName, id), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return id;
  } catch (error) {
    console.error(`Error setting document in ${collectionName}`, error);
    throw error;
  }
};

export const getDocuments = async <T = DocumentData>(
  collectionName: string,
  options?: {
    whereField?: string;
    whereOperation?: "==" | "!=" | ">" | ">=" | "<" | "<=" | "array-contains" | "in" | "array-contains-any" | "not-in";
    whereValue?: any;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
    limitTo?: number;
    startAfterId?: string;
  }
): Promise<Array<T & { id: string }>> => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    let collectionRef = collection(firestoreInstance, collectionName);
    let q = query(collectionRef);
    
    if (options) {
      const constraints = [];
      
      if (options.whereField && options.whereOperation && options.whereValue !== undefined) {
        constraints.push(where(options.whereField, options.whereOperation, options.whereValue));
      }
      
      if (options.orderByField) {
        constraints.push(orderBy(options.orderByField, options.orderDirection || "asc"));
      }
      
      if (options.limitTo) {
        constraints.push(limit(options.limitTo));
      }
      
      if (options.startAfterId && options.orderByField) {
        const startAfterDoc = await getDoc(doc(firestoreInstance, collectionName, options.startAfterId));
        if (startAfterDoc.exists()) {
          constraints.push(startAfter(startAfterDoc));
        }
      }
      
      if (constraints.length > 0) {
        q = query(collectionRef, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T & { id: string }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}`, error);
    throw error;
  }
};

export const getDocumentById = async <T = DocumentData>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    const docRef = doc(firestoreInstance, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T & { id: string };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${id} from ${collectionName}`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: Partial<any>) => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    const docRef = doc(firestoreInstance, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}`, error);
    throw error;
  }
};

export const incrementField = async (
  collectionName: string,
  id: string,
  field: string,
  value: number = 1
) => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    const docRef = doc(firestoreInstance, collectionName, id);
    await updateDoc(docRef, {
      [field]: increment(value),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    console.error(`Error incrementing field ${field} in document ${id}`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    await deleteDoc(doc(firestoreInstance, collectionName, id));
    return id;
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionName}`, error);
    throw error;
  }
};

export const subscribeToDocument = <T = DocumentData>(
  collectionName: string,
  id: string,
  callback: (data: (T & { id: string }) | null) => void
) => {
  const firestoreInstance = getFirestoreInstance();
  
  const docRef = doc(firestoreInstance, collectionName, id);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({
        id: docSnap.id,
        ...docSnap.data()
      } as T & { id: string });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to document ${id} in ${collectionName}`, error);
  });
};

export const subscribeToCollection = <T = DocumentData>(
  collectionName: string,
  callback: (data: Array<T & { id: string }>) => void,
  options?: {
    whereField?: string;
    whereOperation?: "==" | "!=" | ">" | ">=" | "<" | "<=" | "array-contains" | "in" | "array-contains-any" | "not-in";
    whereValue?: any;
    orderByField?: string;
    orderDirection?: "asc" | "desc";
    limitTo?: number;
  }
) => {
  const firestoreInstance = getFirestoreInstance();
  
  let collectionRef = collection(firestoreInstance, collectionName);
  let q = query(collectionRef);
  
  if (options) {
    const constraints = [];
    
    if (options.whereField && options.whereOperation && options.whereValue !== undefined) {
      constraints.push(where(options.whereField, options.whereOperation, options.whereValue));
    }
    
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || "asc"));
    }
    
    if (options.limitTo) {
      constraints.push(limit(options.limitTo));
    }
    
    if (constraints.length > 0) {
      q = query(collectionRef, ...constraints);
    }
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const data: Array<T & { id: string }> = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      } as T & { id: string });
    });
    callback(data);
  }, (error) => {
    console.error(`Error subscribing to collection ${collectionName}`, error);
  });
};

export const batchUpdate = async (
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collectionName: string;
    id: string;
    data?: any;
  }>
) => {
  const firestoreInstance = getFirestoreInstance();
  
  try {
    const batch = writeBatch(firestoreInstance);
    
    operations.forEach(op => {
      const docRef = doc(firestoreInstance, op.collectionName, op.id);
      
      switch (op.type) {
        case 'set':
          batch.set(docRef, {
            ...op.data,
            updatedAt: serverTimestamp()
          }, { merge: true });
          break;
        case 'update':
          batch.update(docRef, {
            ...op.data,
            updatedAt: serverTimestamp()
          });
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error performing batch update", error);
    throw error;
  }
};

// Firebase Storage functions
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageInstance = getStorageInstance();
  
  try {
    const storageRef = ref(storageInstance, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("Error uploading file", error);
    throw error;
  }
};

export const deleteFile = async (path: string): Promise<void> => {
  const storageInstance = getStorageInstance();
  
  try {
    const storageRef = ref(storageInstance, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file", error);
    throw error;
  }
};
