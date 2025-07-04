
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Default demo configuration for when environment variables are not set
const defaultFirebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.firebasestorage.app",
  appId: "demo-app-id",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_PROJECT_ID 
    ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`
    : defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_PROJECT_ID
    ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`
    : defaultFirebaseConfig.storageBucket,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
};

let app: any;
let auth: any;
let db: any;
let storage: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase initialization failed, using demo mode:', error);
  // Firebase will be handled by the offline state management
}

export { auth, db, storage };
