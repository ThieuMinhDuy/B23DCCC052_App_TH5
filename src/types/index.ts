/**
 * Định nghĩa cấu trúc dữ liệu cho Người dùng (User)
 */
export interface User {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: number;
  createdAt?: number;
}

/**
 * Định nghĩa toạ độ GPS vị trí
 */
export interface MessageLocation {
  latitude: number;
  longitude: number;
}

/**
 * Định nghĩa cấu trúc tin nhắn (Message)
 */
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  location?: MessageLocation;
}

/**
 * Định nghĩa thông tin cuộc trò chuyện ở màn hình Home (Conversation)
 */
export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
}

/**
 * Kiểu tham số điều hướng Root Stack
 */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: {
    partnerId: string;
    partnerName: string;
    partnerAvatar?: string;
  };
};

/**
 * Kiểu tham số điều hướng Auth Stack
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Kiểu tham số điều hướng Bottom Tabs
 */
export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};

