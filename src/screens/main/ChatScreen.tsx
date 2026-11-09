import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Message } from '../../types';
import { auth } from '../../services/firebase';
import {
  sendMessage,
  listenMessages,
  markAsRead,
} from '../../services/chatService';
import { listenUserPresence } from '../../services/presenceService';
import { getCurrentLocation } from '../../services/locationService';
import { getChatRoomId, getAvatarColor, getInitials } from '../../utils/chatUtils';
import { ChatBubble } from '../../components/ChatBubble';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { partnerId, partnerName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const currentUid = auth.currentUser?.uid || '';
  const currentDisplayName = auth.currentUser?.displayName || 'Người dùng';
  const roomId = getChatRoomId(currentUid, partnerId);

  // 1. Lắng nghe trạng thái Online/Offline của đối phương trên thanh tiêu đề
  useEffect(() => {
    const unsubscribePresence = listenUserPresence(partnerId, (presence) => {
      setPartnerOnline(presence.isOnline);
    });

    return () => {
      unsubscribePresence();
    };
  }, [partnerId]);

  // 2. Lắng nghe tin nhắn realtime & Đặt unreadCount về 0 khi mở phòng chat
  useEffect(() => {
    markAsRead(currentUid, partnerId);

    const unsubscribeMessages = listenMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    // QUAN TRỌNG: Hủy lắng nghe trong cleanup của useEffect để tin nhắn không bị hiện lặp
    return () => {
      unsubscribeMessages();
      markAsRead(currentUid, partnerId);
    };
  }, [roomId, currentUid, partnerId]);

  // 3. Xử lý gửi tin nhắn văn bản
  const handleSendText = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    try {
      setIsSending(true);
      setInputText('');
      await sendMessage(
        currentUid,
        partnerId,
        textToSend,
        currentDisplayName,
        partnerName
      );
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn: ' + (error?.message || 'Lỗi không xác định'));
    } finally {
      setIsSending(false);
    }
  };

  // 4. Xử lý gửi vị trí GPS (@react-native-community/geolocation)
  const handleSendLocation = async () => {
    if (isLocating) return;

    try {
      setIsLocating(true);
      const coords = await getCurrentLocation();
      if (!coords) {
        Alert.alert(
          'Không thể lấy vị trí',
          'Vui lòng cấp quyền truy cập vị trí và bật định vị GPS trên máy để chia sẻ vị trí.'
        );
        return;
      }

      await sendMessage(
        currentUid,
        partnerId,
        '📍 Vị trí hiện tại',
        currentDisplayName,
        partnerName,
        coords
      );
    } catch (error: any) {
      Alert.alert('Lỗi vị trí', error?.message || 'Không thể chia sẻ vị trí lúc này.');
    } finally {
      setIsLocating(false);
    }
  };

  const partnerAvatarColor = getAvatarColor(partnerName);
  const partnerInitials = getInitials(partnerName);
  const isSendDisabled = inputText.trim().length === 0 || isSending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* THANH TIÊU ĐỀ (HEADER): Tên và trạng thái online/offline của người đang chat */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome5 name="arrow-left" size={17} color="#0F172A" />
        </TouchableOpacity>

        {/* Avatar đối phương kèm chấm trạng thái */}
        <View style={styles.avatarWrapper}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: partnerAvatarColor },
            ]}
          >
            <Text style={styles.avatarText}>{partnerInitials}</Text>
          </View>
          <View
            style={[
              styles.headerStatusDot,
              partnerOnline ? styles.dotOnline : styles.dotOffline,
            ]}
          />
        </View>

        {/* Tên và trạng thái chữ */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.partnerNameText} numberOfLines={1}>
            {partnerName}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.tinyDot,
                partnerOnline ? styles.dotOnline : styles.dotOffline,
              ]}
            />
            <Text
              style={[
                styles.partnerStatusText,
                partnerOnline ? styles.textOnline : styles.textOffline,
              ]}
            >
              {partnerOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>
      </View>

      {/* KHUNG NỘI DUNG CHAT + TỰ CUỘN XUỐNG TIN MỚI NHẤT */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isMe={item.senderId === currentUid}
              />
            )}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyMessagesBox}>
                <FontAwesome5 name="comments" size={44} color="#CBD5E1" solid style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>Bắt đầu cuộc trò chuyện!</Text>
                <Text style={styles.emptySubtitle}>
                  Hãy gửi lời chào đến {partnerName}. Tin nhắn sẽ được gửi nhận tức thời theo thời gian thực.
                </Text>
              </View>
            }
          />
        )}

        {/* THANH NHẬP LIỆU: Khóa gửi tin rỗng + Nút gửi vị trí GPS */}
        <View style={styles.inputContainer}>
          {/* Nút gửi vị trí */}
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleSendLocation}
            disabled={isLocating}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <FontAwesome5 name="map-marker-alt" size={20} color="#2563EB" solid />
            )}
          </TouchableOpacity>

          {/* Ô nhập tin nhắn */}
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={1000}
          />

          {/* Nút Gửi (vô hiệu hoá khi tin rỗng) */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSendDisabled && styles.sendButtonDisabled,
            ]}
            onPress={handleSendText}
            disabled={isSendDisabled}
            activeOpacity={0.8}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <FontAwesome5 name="paper-plane" size={15} color="#FFFFFF" solid />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 6,
    marginRight: 6,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotOnline: {
    backgroundColor: '#22C55E',
  },
  dotOffline: {
    backgroundColor: '#94A3B8',
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  partnerNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tinyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  partnerStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  textOnline: {
    color: '#16A34A',
  },
  textOffline: {
    color: '#94A3B8',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748B',
  },
  messagesList: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyMessagesBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  locationButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#0F172A',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
