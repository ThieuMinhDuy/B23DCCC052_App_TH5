import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, User } from '../../types';
import { auth } from '../../services/firebase';
import { listenAllUsers, filterUsers } from '../../services/userService';
import { UserItem } from '../../components/UserItem';
import { SearchBar } from '../../components/SearchBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUid = auth.currentUser?.uid || '';

  useEffect(() => {
    if (!currentUid) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenAllUsers(currentUid, (userList) => {
      setUsers(userList);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchQuery);
  }, [users, searchQuery]);

  const handleSelectUser = (user: User) => {
    navigation.navigate('Chat', {
      partnerId: user.uid,
      partnerName: user.name,
      partnerAvatar: user.avatar,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Ô tìm kiếm danh bạ */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Tìm bạn theo tên hoặc email..."
      />

      {/* Số lượng liên hệ */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {searchQuery ? `Kết quả tìm kiếm (${filteredUsers.length})` : `Danh bạ (${users.length})`}
        </Text>
      </View>

      {/* Danh sách người dùng */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải danh bạ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <UserItem user={item} onPress={handleSelectUser} />
          )}
          contentContainerStyle={
            filteredUsers.length === 0 ? styles.emptyContainer : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <FontAwesome5
                name={searchQuery ? 'search' : 'user-friends'}
                size={42}
                color="#CBD5E1"
                solid={!searchQuery}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? 'Không tìm thấy người dùng'
                  : 'Chưa có người dùng nào khác'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Vui lòng thử tìm kiếm bằng một từ khóa khác.'
                  : 'Hãy tạo thêm tài khoản thứ hai để trải nghiệm nhắn tin realtime nhé!'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
