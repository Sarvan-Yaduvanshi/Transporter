// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { connectAuthEmulator, getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVssnUsjD_QWHBHd5JWA0eNOTFdOBEVvk",
  authDomain: "transportops-f7889.firebaseapp.com",
  projectId: "transportops-f7889",
  storageBucket: "transportops-f7889.firebasestorage.app",
  messagingSenderId: "884161675481",
  appId: "1:884161675481:web:92ab6b1abc27cb50867ec8",
  measurementId: "G-EC0959PK4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const emulatorHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
if (emulatorHost) {
  const url = emulatorHost.startsWith('http') ? emulatorHost : `http://${emulatorHost}`;
  connectAuthEmulator(auth, url, { disableWarnings: true });
}
const googleProvider = new GoogleAuthProvider();
const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined;

export { app, auth, googleProvider, analytics };
