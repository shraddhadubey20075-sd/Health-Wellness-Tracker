
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYu7nwrF6K8cXbzlqbwFThu4rcvzAAYE8",
  authDomain: "health-wellness-tracker-67593.firebaseapp.com",
  projectId: "health-wellness-tracker-67593",
  storageBucket: "health-wellness-tracker-67593.firebasestorage.app",
  messagingSenderId: "240075061729",
  appId: "1:240075061729:web:169564ca1f8bdd9e26baa0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
