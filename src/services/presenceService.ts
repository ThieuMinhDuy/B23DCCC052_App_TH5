import {
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp,
  off,
} from 'firebase/database';
import { db } from './firebase';

/**
 * Thiết lập hệ thống hiện diện (presence system):
 * Tự động chuyển Online khi kết nối mạng và chuyển Offline khi mất mạng hoặc tắt ứng dụng
 */
export const setupPresence = (uid: string) => {
  if (!uid) return () => {};

  const connectedRef = ref(db, '.info/connected');
  const userStatusRef = ref(db, `status/${uid}`);
  const userOnlineRef = ref(db, `users/${uid}/isOnline`);
  const userLastSeenRef = ref(db, `users/${uid}/lastSeen`);

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    // Thiết lập hành động tự động khi ngắt kết nối
    onDisconnect(userStatusRef).set({
      isOnline: false,
      lastSeen: serverTimestamp(),
    });
    onDisconnect(userOnlineRef).set(false);
    onDisconnect(userLastSeenRef).set(Date.now());

    // Đánh dấu người dùng đang Online
    set(userStatusRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });
    set(userOnlineRef, true);
    set(userLastSeenRef, Date.now());
  });

  return () => {
    off(connectedRef);
  };
};

/**
 * Lắng nghe trạng thái online/offline của một người dùng cụ thể
 */
export const listenUserPresence = (
  uid: string,
  callback: (presence: { isOnline: boolean; lastSeen?: number }) => void
) => {
  if (!uid) return () => {};

  const statusRef = ref(db, `status/${uid}`);
  const unsubscribe = onValue(statusRef, (snapshot) => {
    const val = snapshot.val();
    if (val) {
      callback({
        isOnline: !!val.isOnline,
        lastSeen: typeof val.lastSeen === 'number' ? val.lastSeen : Date.now(),
      });
    } else {
      callback({ isOnline: false });
    }
  });

  return () => off(statusRef);
};

