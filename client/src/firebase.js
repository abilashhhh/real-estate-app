// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "mern-realestate-6b54d.firebaseapp.com",
    projectId: "mern-realestate-6b54d",
    storageBucket: "mern-realestate-6b54d.appspot.com",
    messagingSenderId: "364206991137",
    appId: "1:364206991137:web:3e9712a0ca16914e168060"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);