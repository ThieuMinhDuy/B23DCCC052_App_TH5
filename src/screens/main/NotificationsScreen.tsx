import React from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  icon: string;
  color: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Chào mừng bạn đến với Chat Realtime!',
    content: 'Bạn đã đăng nhập thành công vào ứng dụng chat Firebase. Hãy kết nối và trò chuyện với mọi người.',
    time: 'Vừa xong',
    icon: 'comment-dots',
    color: '#2563EB',
    read: false,
  },
  {
    id: '2',
    title: 'Bảo mật tài khoản',
    content: 'Luật bảo mật Realtime Database và Authentication đã được kích hoạt thành công.',
    time: 'Hôm nay',
    icon: 'shield-alt',
    color: '#16A34A',
    read: true,
  },
  {
    id: '3',
    title: 'Định vị GPS',
    content: 'Ứng dụng đã sẵn sàng hỗ trợ chia sẻ vị trí qua tin nhắn thời gian thực.',
    time: 'Hôm qua',
    icon: 'map-marked-alt',
    color: '#EA580C',
    read: true,
  },
];

export const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <FlatList
        data={SAMPLE_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.notificationCard, !item.read && styles.unreadCard]}>
            <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
              <FontAwesome5 name={item.icon} size={20} color={item.color} solid />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.content}>{item.content}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
  },
  content: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
