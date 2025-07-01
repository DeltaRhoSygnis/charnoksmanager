
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPPca8x5cdT_nTHClFlmsGIV3PE7Abdv4",
  authDomain: "mystoreapp-dcc31.firebaseapp.com",
  projectId: "mystoreapp-dcc31",
  storageBucket: "mystoreapp-dcc31.firebasestorage.app",
  messagingSenderId: "438314522218",
  appId: "1:438314522218:web:900ba71959d6fcd5cd1c13",
  measurementId: "G-H2XHWKZD3C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
