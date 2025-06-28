// firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCbOT7HevPRJTU0oyy1JDsLXVLK77AH-6c",
  authDomain: "agame-9ccc4.firebaseapp.com",
  projectId: "agame-9ccc4",
  storageBucket: "agame-9ccc4.firebasestorage.app",
  messagingSenderId: "985322408657",
  appId: "1:985322408657:web:6ca67db173648b0cf113f0",
  measurementId: "G-LX510L2PHE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  db,
  collection,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  auth
};
