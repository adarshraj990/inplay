import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated,
  Pressable, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface RevealCardProps {
  word: string;
  role: string;
  gameStarted: boolean;
}

import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 420;

const RevealCard: React.FC<RevealCardProps> = ({ word, role, gameStarted }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!gameStarted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRevealed(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => {
      setIsRevealed(false);
    });
  };

  if (!gameStarted) {
    return (
      <View style={[styles.card, styles.waitingCard]}>
        <Ionicons name="hourglass-outline" size={60} color={Colors.textMuted} />
        <Text style={styles.waitingText}>Waiting for host to start...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cardContainer, { transform: [{ scale }] }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed
          ]}
        >
          {/* ── Front Side (Mysterious) ── */}
          {!isRevealed && (
            <LinearGradient
              colors={['#1F1F35', '#0D0D1A']}
              style={styles.content}
            >
              <View style={styles.secretIconCircle}>
                <Ionicons name="help" size={50} color={Colors.turquoise} />
              </View>
              <Text style={styles.promptText}>Hold to reveal secret</Text>
              <Text style={styles.warningText}>Make sure no one is looking! 🤫</Text>
            </LinearGradient>
          )}

          {/* ── Back Side (Secret Info) ── */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
            <LinearGradient
              colors={role === 'Spy' ? ['#FF9F1C', '#FF6B35'] : ['#00D4C8', '#0097A7']}
              style={styles.content}
            >
              <Text style={styles.shhText}>SHHH! KEEP IT SECRET</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleLabel}>YOUR ROLE</Text>
                <Text style={styles.roleValue}>{role.toUpperCase()}</Text>
              </View>
              
              <View style={styles.wordContainer}>
                <Text style={styles.wordLabel}>YOUR WORD</Text>
                <Text style={styles.wordValue}>{word}</Text>
              </View>

              <Ionicons 
                name={role === 'Spy' ? "eye-off" : "people"} 
                size={80} 
                color="rgba(255,255,255,0.2)" 
                style={styles.bgIcon}
              />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: CARD_HEIGHT, width: CARD_WIDTH, alignItems: 'center', justifyContent: 'center' },
  cardContainer: { width: '100%', height: '100%' },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  cardPressed: { borderColor: Colors.turquoise },
  waitingCard: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, borderStyle: 'dashed' },
  waitingText: { fontSize: Typography.body, color: Colors.textSecondary, textAlign: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  secretIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 200, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  promptText: { fontSize: Typography.h2, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs },
  warningText: { fontSize: Typography.caption, color: Colors.textMuted },
  shhText: { 
    position: 'absolute', 
    top: Spacing.xl, 
    fontSize: Typography.tiny, 
    fontWeight: '900', 
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2
  },
  roleTag: { alignItems: 'center', marginBottom: Spacing.xl },
  roleLabel: { fontSize: Typography.tiny, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  roleValue: { fontSize: Typography.hero, fontWeight: '900', color: '#fff' },
  wordContainer: { 
    backgroundColor: 'rgba(0,0,0,0.15)', 
    paddingHorizontal: Spacing.xl, 
    paddingVertical: Spacing.md, 
    borderRadius: Radius.md,
    alignItems: 'center'
  },
  wordLabel: { fontSize: Typography.tiny, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  wordValue: { fontSize: Typography.h1, fontWeight: '900', color: '#fff' },
  bgIcon: { position: 'absolute', bottom: -20, right: -20 },
});

export default RevealCard;
