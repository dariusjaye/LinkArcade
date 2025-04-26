import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    return user;
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const result = await firebaseSignInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email and password", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = async <T extends {}>(collectionName: string, data: T) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
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
  try {
    await setDoc(doc(db, collectionName, id), {
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
  try {
    let collectionRef = collection(db, collectionName);
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
        const startAfterDoc = await getDoc(doc(db, collectionName, options.startAfterId));
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
  try {
    const docRef = doc(db, collectionName, id);
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
  try {
    const docRef = doc(db, collectionName, id);
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
  try {
    const docRef = doc(db, collectionName, id);
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
  try {
    await deleteDoc(doc(db, collectionName, id));
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
  const docRef = doc(db, collectionName, id);
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
  let collectionRef = collection(db, collectionName);
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
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T & { id: string }));
    callback(documents);
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
  try {
    const batch = writeBatch(db);
    
    operations.forEach((operation) => {
      const docRef = doc(db, operation.collectionName, operation.id);
      
      switch (operation.type) {
        case 'set':
          batch.set(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          break;
        case 'update':
          batch.update(docRef, {
            ...operation.data,
            updatedAt: serverTimestamp(),
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
    console.error('Error performing batch update', error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading file', error);
    throw error;
  }
};

export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file', error);
    throw error;
  }
};
