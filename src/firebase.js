import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "wildlife-pnw.firebaseapp.com",
  projectId: "wildlife-pnw",
  storageBucket: "wildlife-pnw.firebasestorage.app",
  messagingSenderId: "485271636657",
  appId: "1:485271636657:web:93d42e39755a07d5b27090"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };