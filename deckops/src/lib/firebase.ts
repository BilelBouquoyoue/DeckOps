import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC0axBakzcPJz7V0jDaA3VF2lqxkznzm5w",
  authDomain: "deckops-yugioh.firebaseapp.com",
  projectId: "deckops-yugioh",
  storageBucket: "deckops-yugioh.firebasestorage.app",
  messagingSenderId: "476012805039",
  appId: "1:476012805039:web:a2d9db34f6992cedb70d5a",
  measurementId: "G-YRRME7M8LK"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize analytics only if supported
export const initializeAnalytics = async () => {
  try {
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      return getAnalytics(app);
    }
    return null;
  } catch (error) {
    console.error('Analytics initialization error:', error);
    return null;
  }
};