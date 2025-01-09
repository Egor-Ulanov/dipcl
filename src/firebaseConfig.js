// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDC9rCLQ6LGVnGTjhtVKUN9kQ9oqwUFRmk",
  authDomain: "dipl-12202.firebaseapp.com",
  projectId: "dipl-12202",
  storageBucket: "dipl-12202.firebasestorage.app",
  messagingSenderId: "818277910325",
  appId: "1:818277910325:web:efdcc2cf931ad2fbd1ae7c",
  measurementId: "G-HBWE0HFDC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
