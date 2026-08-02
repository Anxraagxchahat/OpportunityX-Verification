import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQelFrtdJNVVpWXhIfNx94JTYi0KDgKVM",
  authDomain: "verify-opportunityx.firebaseapp.com",
  projectId: "verify-opportunityx",
  storageBucket: "verify-opportunityx.firebasestorage.app",
  messagingSenderId: "758671695308",
  appId: "1:758671695308:web:ad64d7ba5dd666bdc65169",
  measurementId: "G-H96FT8556F"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
