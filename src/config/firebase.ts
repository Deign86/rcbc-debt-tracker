import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for RCBC Debt Tracker
const firebaseConfig = {
  apiKey: "AIzaSyC6uIidtROxzOmkcdIaLhOUuvAua-8u24I",
  authDomain: "rcbc-debt-tracker-app.firebaseapp.com",
  projectId: "rcbc-debt-tracker-app",
  storageBucket: "rcbc-debt-tracker-app.firebasestorage.app",
  messagingSenderId: "1032519145646",
  appId: "1:1032519145646:web:0377a94b9799cbd550b53f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable Firestore offline persistence for faster loads
// This caches Firestore data in IndexedDB for instant access on subsequent loads
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.warn('Firestore persistence not available in this browser');
  }
});

export default app;
