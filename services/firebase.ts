// Explicitly use scoped package imports to resolve resolution issues in specific build environments
import { initializeApp, getApps, getApp } from '@firebase/app';
import type { FirebaseApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';
import type { Firestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';
import type { FirebaseStorage } from '@firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDewC-A3_n0rBh__Zr1fhEbX1qd_F6_ro8",
  authDomain: "alandalus-memory.firebaseapp.com",
  projectId: "alandalus-memory",
  storageBucket: "alandalus-memory.firebasestorage.app",
  messagingSenderId: "238890804288",
  appId: "1:238890804288:web:b93d9b166f5b065513aba5",
  measurementId: "G-LH5TE4QL6X"
};

// Singleton pattern to ensure only one Firebase app instance exists
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Export specific service instances
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
