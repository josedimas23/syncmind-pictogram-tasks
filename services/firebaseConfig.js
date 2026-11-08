// Firebase configuration, read from environment variables (see .env.example).
// Expo only inlines literal `process.env.EXPO_PUBLIC_*` reads, so do not alias process.env.
// Without credentials, or with EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true, the app
// connects to the local Firestore emulator with a demo project (`npm run demo`).
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

export const useEmulator =
  process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true' ||
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

export const firebaseConfig = useEmulator
  ? { apiKey: 'demo-api-key', projectId: 'demo-pictogram-tasks', appId: 'demo-app-id' }
  : {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

// Initialise once here so the emulator is connected before any screen uses Firestore.
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
  if (useEmulator) {
    const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
    connectFirestoreEmulator(getFirestore(), host, 8180);
  }
}
