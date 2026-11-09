import React, { useState, useEffect } from 'react';
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
import { RootStackParamList, Conversation } from '../../types';
import { auth } from '../../services/firebase';
import { listenUserChats, markAsRead } from '../../services/chatService';
import { ConversationItem } from '../../components/ConversationItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUid = auth.currentUser?.uid || '';

  useEffect(() => {
    if (!currentUid) {
      setLoading(false);
      return;
    }

    // Lắng nghe danh sách cuộc trò chuyện theo thời gian thực (đã sort tin mới nhất lên đầu)
    const unsubscribe = listenUserChats(currentUid, (chats) => {
      setConversations(chats);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  const handleOpenChat = async (conversation: Conversation) => {
    await markAsRead(currentUid, conversation.partnerId);

    navigation.navigate('Chat', {
      partnerId: conversation.partnerId,
      partnerName: conversation.partnerName,
      partnerAvatar: conversation.partnerAvatar,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.partnerId}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={handleOpenChat}
            />
          )}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <FontAwesome5 name="comments" size={48} color="#CBD5E1" solid style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptySubtitle}>
                Chuyển sang tab "Danh bạ" bên dưới và chọn một người để bắt đầu nhắn tin realtime nhé!
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
  listContent: {
    paddingVertical: 4,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
