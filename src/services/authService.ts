import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ref, set, serverTimestamp, update, get } from 'firebase/database';
import { auth, db } from './firebase';
import { User } from '../types';

/**
 * Đăng ký tài khoản người dùng với Firebase Authentication và lưu profile vào Realtime Database
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    trimmedEmail,
    password
  );
  const firebaseUser = userCredential.user;

  // Cập nhật tên hiển thị trong Auth profile
  await updateProfile(firebaseUser, {
    displayName: trimmedName,
  });

  const now = Date.now();
  const userData: User = {
    uid: firebaseUser.uid,
    name: trimmedName,
    email: trimmedEmail,
    isOnline: true,
    lastSeen: now,
    createdAt: now,
  };

  // Lưu thông tin người dùng vào Realtime Database tại /users/{uid}
  await set(ref(db, `users/${firebaseUser.uid}`), userData);

  // Đặt trạng thái ban đầu tại /status/{uid}
  await set(ref(db, `status/${firebaseUser.uid}`), {
    isOnline: true,
    lastSeen: serverTimestamp(),
  });

  return userData;
};

/**
 * Đảm bảo profile người dùng đã có trong /users/{uid}
 */
export const syncUserProfile = async (firebaseUser: any) => {
  if (!firebaseUser?.uid) return;
  try {
    const userRef = ref(db, `users/${firebaseUser.uid}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      await set(userRef, {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Người dùng',
        email: firebaseUser.email || '',
        isOnline: true,
        lastSeen: Date.now(),
        createdAt: Date.now(),
      });
    } else {
      await update(userRef, {
        isOnline: true,
        lastSeen: Date.now(),
      });
    }

    await set(ref(db, `status/${firebaseUser.uid}`), {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Lỗi đồng bộ user profile:', err);
  }
};

/**
 * Đăng nhập với Email và Mật khẩu
 */
export const loginUser = async (email: string, password: string) => {
  const trimmedEmail = email.trim();
  const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
  const firebaseUser = userCredential.user;

  await syncUserProfile(firebaseUser);

  return firebaseUser;
};

/**
 * Đăng xuất người dùng và cập nhật trạng thái offline
 */
export const logoutUser = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await update(ref(db, `users/${currentUser.uid}`), {
        isOnline: false,
        lastSeen: Date.now(),
      });
      await update(ref(db, `status/${currentUser.uid}`), {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Lỗi cập nhật trạng thái offline khi đăng xuất:', e);
    }
  }
  await signOut(auth);
};

/**
 * Lấy thông tin user hiện tại
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Chuyển đổi mã lỗi Firebase Authentication sang thông báo tiếng Việt dễ hiểu
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Tài khoản hoặc mật khẩu không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản khác.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có tối thiểu 6 ký tự.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng, vui lòng kiểm tra lại đường truyền.';
    case 'auth/too-many-requests':
      return 'Đã thử quá nhiều lần, vui lòng chờ trong giây lát.';
    default:
      return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
  }
};

