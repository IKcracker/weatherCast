// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGD4fzT4X_MocwZNbB0Av8zrL_5Zi7T70",
  authDomain: "employee-22.firebaseapp.com",
  projectId: "employee-22",
  storageBucket: "employee-22.appspot.com",
  messagingSenderId: "567368474043",
  appId: "1:567368474043:web:ec8cb2650def49e37cb89e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };