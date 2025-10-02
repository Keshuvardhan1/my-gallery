import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBVLDwCFyjJuhA3LdvMogWod0gZ6DpifX0",
  authDomain: "mygallery-99e5c.firebaseapp.com",
  projectId: "mygallery-99e5c",
  storageBucket: "mygallery-99e5c.firebasestorage.app",
  messagingSenderId: "141187149875",
  appId: "1:141187149875:web:4c87c1aad59329b8b9f346"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
