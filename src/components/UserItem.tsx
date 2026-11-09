import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { User } from '../types';
import { getAvatarColor, getInitials } from '../utils/chatUtils';
import { listenUserPresence } from '../services/presenceService';

interface UserItemProps {
  user: User;
  onPress: (user: User) => void;
}

export const UserItem: React.FC<UserItemProps> = ({ user, onPress }) => {
  const [isOnline, setIsOnline] = useState<boolean>(user.isOnline ?? false);

  useEffect(() => {
    const unsubscribe = listenUserPresence(user.uid, (presence) => {
      setIsOnline(presence.isOnline);
    });

    return () => {
      unsubscribe();
    };
  }, [user.uid]);

  const avatarColor = getAvatarColor(user.name);
  const initials = getInitials(user.name);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(user)}
      activeOpacity={0.7}
    >
      {/* Khung Avatar kèm chấm trạng thái Online/Offline */}
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            isOnline ? styles.statusOnline : styles.statusOffline,
          ]}
        />
      </View>

      {/* Thông tin người dùng */}
      <View style={styles.infoWrapper}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          <Text
            style={[
              styles.statusText,
              isOnline ? styles.textOnline : styles.textOffline,
            ]}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
      </View>

      {/* Mũi tên dẫn hướng sang Chat bằng FontAwesome5 */}
      <FontAwesome5 name="chevron-right" size={13} color="#CBD5E1" style={styles.arrowIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  statusOnline: {
    backgroundColor: '#22C55E',
  },
  statusOffline: {
    backgroundColor: '#94A3B8',
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textOnline: {
    color: '#16A34A',
  },
  textOffline: {
    color: '#94A3B8',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
  },
  arrowIcon: {
    marginLeft: 10,
  },
});
