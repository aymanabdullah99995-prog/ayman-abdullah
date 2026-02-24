
// Import the modular Firebase SDK functions correctly from firebase/app
// These are the standard named exports for v9+ of the Firebase JavaScript SDK.
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase Configuration - Standard web configuration
const firebaseConfig = {
  apiKey: "AIzaSyDewC-A3_n0rBh__Zr1fhEbX1qd_F6_ro8",
  authDomain: "alandalus-memory.firebaseapp.com",
  projectId: "alandalus-memory",
  storageBucket: "alandalus-memory.firebasestorage.app",
  messagingSenderId: "238890804288",
  appId: "1:238890804288:web:b93d9b166f5b065513aba5",
};

let app: FirebaseApp;
let db: Firestore;

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  // Initialize Firestore
  db = getFirestore(app);
} catch (error) {
  console.error("Error initializing Firebase/Firestore:", error);
  throw error;
}

export { db, app };
