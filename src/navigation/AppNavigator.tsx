import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { setupPresence } from '../services/presenceService';
import { syncUserProfile } from '../services/authService';
import { RootStackParamList } from '../types';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { ChatScreen } from '../screens/main/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập của Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [initializing]);

  useEffect(() => {
    // Khi user đã đăng nhập, tự động kích hoạt hệ thống presence và đồng bộ profile
    if (currentUser?.uid) {
      syncUserProfile(currentUser);
      const cleanupPresence = setupPresence(currentUser.uid);
      return () => {
        cleanupPresence();
      };
    }
  }, [currentUser]);

  // Màn hình Splash/Loading trong lúc Firebase kiểm tra phiên đăng nhập
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!currentUser ? (
        // Chưa đăng nhập -> Vào luồng Auth (Login, Register)
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // Đã đăng nhập -> Vào Main App (Bottom Tabs & Chat)
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              headerShown: false, // Header sẽ tự custom chi tiết ở ChatScreen
              animation: 'slide_from_right',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});

