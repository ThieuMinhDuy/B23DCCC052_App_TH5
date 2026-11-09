import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from '../types';
import { getAvatarColor, getInitials, formatConversationTime } from '../utils/chatUtils';
import { listenUserPresence } from '../services/presenceService';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // Lắng nghe trạng thái online/offline của đối phương
  useEffect(() => {
    const unsubscribe = listenUserPresence(conversation.partnerId, (presence) => {
      setIsOnline(presence.isOnline);
    });

    return () => {
      unsubscribe();
    };
  }, [conversation.partnerId]);

  const avatarColor = getAvatarColor(conversation.partnerName);
  const initials = getInitials(conversation.partnerName);
  const formattedTime = formatConversationTime(conversation.timestamp);
  const unreadCount = conversation.unreadCount || 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
    >
      {/* Avatar kèm chấm trạng thái Online/Offline */}
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            isOnline ? styles.dotOnline : styles.dotOffline,
          ]}
        />
      </View>

      {/* Nội dung cuộc trò chuyện */}
      <View style={styles.contentWrapper}>
        <View style={styles.topRow}>
          <Text style={styles.partnerName} numberOfLines={1}>
            {conversation.partnerName}
          </Text>
          <Text
            style={[
              styles.timeText,
              unreadCount > 0 && styles.timeTextUnread,
            ]}
          >
            {formattedTime}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage || 'Bắt đầu cuộc trò chuyện'}
          </Text>

          {/* HUY HIỆU SỐ TIN CHƯA ĐỌC (UNREAD BADGE) */}
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotOnline: {
    backgroundColor: '#22C55E', // Xanh lá cây (Online)
  },
  dotOffline: {
    backgroundColor: '#94A3B8', // Xám (Offline)
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  timeTextUnread: {
    color: '#2563EB',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: '#0F172A',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#EF4444', // Màu đỏ nổi bật cho tin chưa đọc
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

