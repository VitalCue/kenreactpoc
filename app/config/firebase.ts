import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRmPHxnhdv0JXH8yNNkMCdYHZdTXGBGbM",
  authDomain: "healthpoc-12869.firebaseapp.com",
  projectId: "healthpoc-12869",
  storageBucket: "healthpoc-12869.firebasestorage.app",
  messagingSenderId: "770470667577",
  appId: "1:770470667577:web:4584df9462fa470bad34e8",
  measurementId: "G-Y8D31QDMW8"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
let auth: ReturnType<typeof getAuth>;
try {
  // Try to initialize auth first
  auth = initializeAuth(app);
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
export default app;