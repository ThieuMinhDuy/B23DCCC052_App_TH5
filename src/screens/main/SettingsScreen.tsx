import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { auth } from '../../services/firebase';
import { logoutUser } from '../../services/authService';
import { getAvatarColor, getInitials } from '../../utils/chatUtils';

export const SettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const currentUser = auth.currentUser;
  const displayName = currentUser?.displayName || 'Người dùng';
  const email = currentUser?.email || 'Chưa cập nhật email';

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logoutUser();
            } catch (error: any) {
              Alert.alert('Lỗi', 'Không thể đăng xuất: ' + (error?.message || 'Đã có lỗi'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Profile */}
      <View style={styles.profileCard}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: getAvatarColor(displayName) },
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.section}>
        <View style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="id-card" size={18} color="#2563EB" solid />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Mã tài khoản (UID)</Text>
            <Text style={styles.menuSubtitle} numberOfLines={1}>
              {currentUser?.uid || 'Chưa có'}
            </Text>
          </View>
        </View>

        <View style={styles.menuItem}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="bolt" size={18} color="#16A34A" solid />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Trạng thái</Text>
            <Text style={[styles.menuSubtitle, { color: '#16A34A', fontWeight: '600' }]}>
              Đang hoạt động (Online)
            </Text>
          </View>
        </View>
      </View>

      {/* Nút Đăng xuất */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#EF4444" size="small" />
        ) : (
          <>
            <FontAwesome5 name="sign-out-alt" size={17} color="#DC2626" solid style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});
