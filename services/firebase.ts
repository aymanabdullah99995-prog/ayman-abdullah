
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDewC-A3_n0rBh__Zr1fhEbX1qd_F6_ro8",
  authDomain: "alandalus-memory.firebaseapp.com",
  projectId: "alandalus-memory",
  storageBucket: "alandalus-memory.firebasestorage.app",
  messagingSenderId: "238890804288",
  appId: "1:238890804288:web:b93d9b166f5b065513aba5",
  measurementId: "G-LH5TE4QL6X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
