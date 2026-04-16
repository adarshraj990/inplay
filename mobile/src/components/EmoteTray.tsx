import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { useEmotes } from '../context/EmoteContext';

const EMOTES = ['😂', '😡', '🤫', '😑', '😴', '🔥'];

const EmoteTray: React.FC<{ sessionId: string, gameType: string }> = ({ sessionId, gameType }) => {
  const { triggerEmote } = useEmotes();

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.blur}>
        {EMOTES.map(emoji => (
          <TouchableOpacity 
            key={emoji}
            style={styles.btn}
            onPress={() => triggerEmote(sessionId, gameType, emoji)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  blur: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: Spacing.sm,
  },
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  emoji: {
    fontSize: Typography.h2,
  }
});

export default EmoteTray;
