/**
 * Tạo ID phòng chat 1-1 đồng nhất giữa 2 người dùng.
 * Bằng cách sắp xếp 2 UID theo thứ tự chữ cái và nối với nhau,
 * đảm bảo dù A nhắn cho B hay B nhắn cho A thì cả 2 đều luôn vào chung 1 phòng.
 */
export const getChatRoomId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

/**
 * Định dạng thời gian cho từng tin nhắn trong phòng Chat: "HH:mm" (ví dụ: "14:25")
 */
export const formatMessageTime = (timestamp: number): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Định dạng thời gian cho danh sách cuộc trò chuyện ở màn hình Home:
 * - Nếu tin gửi trong ngày hôm nay: Hiển thị "HH:mm" (ví dụ: "14:25")
 * - Nếu tin gửi ở ngày khác: Hiển thị "dd/MM" (ví dụ: "09/11")
 */
export const formatConversationTime = (timestamp: number): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};

/**
 * Lấy 2 chữ cái viết tắt từ họ tên để hiển thị trên Avatar (ví dụ: "Nguyễn Văn A" -> "NA")
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Sinh màu nền ngẫu nhiên nhưng cố định theo chuỗi tên để avatar luôn đẹp mắt
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#DB2777', // Pink
    '#EA580C', // Orange
    '#059669', // Emerald
    '#0891B2', // Cyan
    '#4F46E5', // Indigo
    '#D97706', // Amber
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

