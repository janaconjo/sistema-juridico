import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2xArCM8l7ldzLUXAUQMO2Zw6CHGu-nRw",
  authDomain: "ipaj-46cd9.firebaseapp.com",
  projectId: "ipaj-46cd9",
  storageBucket: "ipaj-46cd9.appspot.com",
  messagingSenderId: "102108592715",
  appId: "1:102108592715:web:d40c3efd23c9dd77522bce",
  measurementId: "G-JM3W9VZRJC"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword };
