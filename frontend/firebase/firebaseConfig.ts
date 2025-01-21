
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBzaHG1HneR3JRRPR1fT6BZ-iRWH4dmF_E",
  authDomain: "rxion-ddf98.firebaseapp.com",
  projectId: "rxion-ddf98",
  storageBucket: "rxion-ddf98.firebasestorage.app",
  messagingSenderId: "385398386397",
  appId: "1:385398386397:web:b1c78ba04af3c7c40bf534"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;