import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Message } from '../types';
import { formatMessageTime } from '../utils/chatUtils';

interface ChatBubbleProps {
  message: Message;
  isMe: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMe }) => {
  const formattedTime = formatMessageTime(message.timestamp);

  const handleOpenMap = () => {
    if (message.location) {
      const { latitude, longitude } = message.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url).catch((err) =>
        console.warn('Không thể mở bản đồ:', err)
      );
    }
  };

  return (
    <View
      style={[
        styles.rowContainer,
        isMe ? styles.rowMe : styles.rowPartner,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubblePartner,
        ]}
      >
        {/* Nội dung tin nhắn toạ độ vị trí nếu có */}
        {message.location ? (
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={handleOpenMap}
            activeOpacity={0.8}
          >
            <View style={styles.locationHeader}>
              <FontAwesome5
                name="map-marker-alt"
                size={17}
                color={isMe ? '#FFFFFF' : '#EF4444'}
                solid
                style={styles.locationIcon}
              />
              <Text
                style={[
                  styles.locationTitle,
                  isMe ? styles.textWhite : styles.textDark,
                ]}
              >
                Vị trí được chia sẻ
              </Text>
            </View>
            <Text
              style={[
                styles.locationCoords,
                isMe ? styles.textLightBlue : styles.textGray,
              ]}
            >
              Toạ độ: {message.location.latitude.toFixed(5)},{' '}
              {message.location.longitude.toFixed(5)}
            </Text>
            <Text
              style={[
                styles.openMapText,
                isMe ? styles.openMapMe : styles.openMapPartner,
              ]}
            >
              Nhấn để xem trên Google Maps ↗
            </Text>
          </TouchableOpacity>
        ) : (
          /* Nội dung tin nhắn văn bản thông thường */
          <Text
            style={[
              styles.messageText,
              isMe ? styles.textWhite : styles.textDark,
            ]}
          >
            {message.text}
          </Text>
        )}

        {/* Thời gian gửi tin */}
        <Text
          style={[
            styles.timeText,
            isMe ? styles.timeMe : styles.timePartner,
          ]}
        >
          {formattedTime}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowPartner: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  bubblePartner: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#0F172A',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: '#BFDBFE',
  },
  timePartner: {
    color: '#94A3B8',
  },
  locationContainer: {
    paddingVertical: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  locationCoords: {
    fontSize: 12,
    marginBottom: 6,
  },
  textLightBlue: {
    color: '#DBEAFE',
  },
  textGray: {
    color: '#64748B',
  },
  openMapText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  openMapMe: {
    color: '#FFFFFF',
  },
  openMapPartner: {
    color: '#2563EB',
  },
});
