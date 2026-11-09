import { ref, onValue, off, get } from 'firebase/database';
import { db } from './firebase';
import { User } from '../types';

/**
 * Lắng nghe toàn bộ danh sách người dùng đã đăng ký (loại trừ tài khoản hiện tại)
 * Trả về hàm hủy unsubscribe để gọi trong cleanup của useEffect
 */
export const listenAllUsers = (
  currentUid: string,
  callback: (users: User[]) => void
) => {
  const usersRef = ref(db, 'users');

  const unsubscribe = onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const userList: User[] = Object.keys(data)
      .filter((uid) => uid !== currentUid)
      .map((uid) => ({
        uid,
        ...data[uid],
      }));

    callback(userList);
  });

  return () => {
    off(usersRef);
  };
};

/**
 * Lấy thông tin của một người dùng theo UID
 */
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userSnapshot = await get(ref(db, `users/${uid}`));
    if (userSnapshot.exists()) {
      return {
        uid,
        ...userSnapshot.val(),
      };
    }
  } catch (error) {
    console.warn(`Lỗi khi lấy thông tin user ${uid}:`, error);
  }
  return null;
};

/**
 * Lọc danh sách người dùng theo từ khóa tìm kiếm (theo tên hoặc email)
 */
export const filterUsers = (users: User[], keyword: string): User[] => {
  if (!keyword || keyword.trim() === '') return users;
  const lowerKeyword = keyword.trim().toLowerCase();
  return users.filter(
    (user) =>
      user.name?.toLowerCase().includes(lowerKeyword) ||
      user.email?.toLowerCase().includes(lowerKeyword)
  );
};

