import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CẤU HÌNH FIREBASE CỦA BẠN
// Thay thế các giá trị bên dưới bằng thông tin lấy từ Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBiojFBuW2yR2sYkshbswTtL-6t-fJikNA",
  authDomain: "chatapp-76940.firebaseapp.com",
  databaseURL: "https://chatapp-76940-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatapp-76940",
  storageBucket: "chatapp-76940.firebasestorage.app",
  messagingSenderId: "635310061930",
  appId: "1:635310061930:web:6fbc614a964f58aecf8d13",
  measurementId: "G-6GKH110VTM"
};

// Khởi tạo Firebase App (tránh duplicate app khi hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Authentication với persistence lưu phiên đăng nhập vào AsyncStorage
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Fallback nếu đã được khởi tạo
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

// Khởi tạo Realtime Database
const db = getDatabase(app);

export { app, auth, db, firebaseConfig };

