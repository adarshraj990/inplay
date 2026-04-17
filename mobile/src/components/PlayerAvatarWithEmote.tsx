import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  interpolate,
  withSpring
} from 'react-native-reanimated';
import { useEmotes } from '../context/EmoteContext';
import { Colors, Radius, Spacing } from '../constants/theme';

interface PlayerAvatarWithEmoteProps {
  userId: string;
  avatarUrl: string;
  size?: number;
  isHost?: boolean;
}

const PlayerAvatarWithEmote: React.FC<PlayerAvatarWithEmoteProps> = ({ 
  userId, 
  avatarUrl, 
  size = 56,
  isHost = false 
}) => {
  const { activeEmotes } = useEmotes();
  const currentEmote = activeEmotes[userId];

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (currentEmote) {
      // Trigger animation
      translateY.value = 0;
      opacity.value = 1;
      scale.value = withSpring(1.2);

      translateY.value = withTiming(-60, {
        duration: 2500,
        easing: Easing.out(Easing.quad),
      });

      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1800, withTiming(0, { duration: 500 }))
      );
      
      scale.value = withDelay(2000, withTiming(0, { duration: 500 }));
    }
  }, [currentEmote]);

  const emoteStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ] as any,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* ── Avatar Circle ── */}
      <View style={[
        styles.avatarWrap, 
        { borderRadius: size / 2 },
        isHost && styles.hostBorder
      ]}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={[styles.avatar, { borderRadius: size / 2 - 2 }]} 
        />
        {isHost && (
          <View style={styles.hostBadge}>
            <Text style={styles.hostBadgeText}>★</Text>
          </View>
        )}
      </View>

      {/* ── Floating Emote ── */}
      {currentEmote && (
        <Animated.View style={[styles.emoteContainer, emoteStyle]}>
          <View style={styles.emoteBubble}>
            <Text style={styles.emoteText}>{currentEmote.emoji}</Text>
          </View>
          <View style={styles.emoteTail} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { 
    width: '100%', 
    height: '100%', 
    padding: 2, 
    backgroundColor: Colors.surfaceBorder,
    overflow: 'visible'
  },
  hostBorder: { backgroundColor: Colors.saffron },
  avatar: { width: '100%', height: '100%', borderWidth: 2, borderColor: Colors.background },
  hostBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.saffron,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  hostBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  emoteContainer: {
    position: 'absolute',
    top: -10,
    zIndex: 999,
    alignItems: 'center',
  },
  emoteBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emoteText: { fontSize: 28 },
  emoteTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    marginTop: -1,
  },
});

export default PlayerAvatarWithEmote;
