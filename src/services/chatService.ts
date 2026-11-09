import {
  ref,
  push,
  set,
  update,
  onValue,
  off,
  increment,
} from 'firebase/database';
import { db } from './firebase';
import { Message, Conversation, MessageLocation } from '../types';
import { getChatRoomId } from '../utils/chatUtils';

/**
 * Gửi tin nhắn mới trong phòng chat 1-1
 * 1. Đẩy tin nhắn vào node /messages/{roomId}
 * 2. Cập nhật cuộc trò chuyện ở người gửi (unreadCount = 0)
 * 3. Cập nhật cuộc trò chuyện ở người nhận (unreadCount = unreadCount + 1)
 */
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
  senderName?: string,
  receiverName?: string,
  location?: MessageLocation
) => {
  const trimmedText = text.trim();
  if (!trimmedText && !location) {
    throw new Error('Không thể gửi tin nhắn rỗng.');
  }

  const roomId = getChatRoomId(senderId, receiverId);
  const now = Date.now();
  const messagesRef = ref(db, `messages/${roomId}`);
  const newMessageRef = push(messagesRef);

  const messageData: Message = {
    id: newMessageRef.key || `${now}`,
    senderId,
    receiverId,
    text: trimmedText || '📍 Đã chia sẻ vị trí',
    timestamp: now,
    ...(location ? { location } : {}),
  };

  const previewText = location ? '📍 [Vị trí]' : trimmedText;

  // 1. Lưu tin nhắn vào phòng chat
  await set(newMessageRef, messageData);

  // 2. Cập nhật /userChats của Người gửi (unreadCount = 0)
  const senderChatRef = ref(db, `userChats/${senderId}/${receiverId}`);
  await update(senderChatRef, {
    partnerId: receiverId,
    partnerName: receiverName || 'Người dùng',
    lastMessage: previewText,
    timestamp: now,
    unreadCount: 0,
  });

  // 3. Cập nhật /userChats của Người nhận (tăng unreadCount lên 1)
  const receiverChatRef = ref(db, `userChats/${receiverId}/${senderId}`);
  await update(receiverChatRef, {
    partnerId: senderId,
    partnerName: senderName || 'Người dùng',
    lastMessage: previewText,
    timestamp: now,
    unreadCount: increment(1),
  });

  return messageData;
};

/**
 * Lắng nghe toàn bộ tin nhắn trong một phòng chat theo thời gian thực
 * TRẢ VỀ HÀM HỦY LẮNG NGHE để gọi trong useEffect cleanup -> chống lặp tin nhắn
 */
export const listenMessages = (
  roomId: string,
  callback: (messages: Message[]) => void
) => {
  const chatRef = ref(db, `messages/${roomId}`);

  const unsubscribe = onValue(chatRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const messageList: Message[] = Object.values(data);
    // Sắp xếp tin nhắn theo thứ tự thời gian tăng dần
    messageList.sort((a, b) => a.timestamp - b.timestamp);
    callback(messageList);
  });

  // Hủy lắng nghe
  return () => {
    off(chatRef);
  };
};

/**
 * Lắng nghe danh sách cuộc trò chuyện của một người dùng ở màn hình Home
 * - Sắp xếp cuộc trò chuyện có tin nhắn mới nhất lên đầu
 * - Cung cấp unreadCount theo thời gian thực
 */
export const listenUserChats = (
  currentUid: string,
  callback: (conversations: Conversation[]) => void
) => {
  const userChatsRef = ref(db, `userChats/${currentUid}`);

  const unsubscribe = onValue(userChatsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const conversationList: Conversation[] = Object.values(data);
    // Cuộc trò chuyện có tin nhắn mới nhất nằm trên cùng
    conversationList.sort((a, b) => b.timestamp - a.timestamp);
    callback(conversationList);
  });

  return () => {
    off(userChatsRef);
  };
};

/**
 * Đặt lại số tin chưa đọc (unreadCount) về 0 khi người dùng mở phòng chat
 */
export const markAsRead = async (currentUid: string, partnerUid: string) => {
  try {
    const chatRef = ref(db, `userChats/${currentUid}/${partnerUid}`);
    await update(chatRef, {
      unreadCount: 0,
    });
  } catch (error) {
    console.warn('Lỗi khi đánh dấu đã đọc cuộc trò chuyện:', error);
  }
};

