import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

interface GameCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  playerCount: string;
  tag: string;
  tagColor?: string;
  onPress?: () => void;
  featured?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  title, description, icon, playerCount, tag,
  tagColor = Colors.turquoise, onPress, featured = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] as any }, featured && Shadows.glow]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.touchable}
      >
        <LinearGradient
          colors={featured ? ['#0F3460', '#1A1A2E'] : ['#16213E', '#0D0D1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Icon area */}
          <LinearGradient
            colors={featured ? Colors.gradientTurquoise : [Colors.surfaceBorder, '#0D1B3E']}
            style={styles.iconContainer}
          >
            <Ionicons
              name={icon}
              size={32}
              color={featured ? Colors.surface : Colors.turquoise}
            />
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.tagRow}>
              <View style={[styles.tag, { backgroundColor: tagColor + '22', borderColor: tagColor + '55' }]}>
                <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
              </View>
              {featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={10} color={Colors.saffron} />
                  <Text style={styles.featuredText}>FEATURED</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description} numberOfLines={2}>{description}</Text>

            <View style={styles.footer}>
              <View style={styles.playerRow}>
                <Ionicons name="people" size={14} color={Colors.textSecondary} />
                <Text style={styles.playerCount}>{playerCount} players</Text>
              </View>
              <View style={styles.playBtn}>
                <Ionicons name="play-circle" size={16} color={Colors.turquoise} />
                <Text style={styles.playText}>Play</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  touchable: { borderRadius: Radius.lg, overflow: 'hidden' },
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: Spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: Spacing.xs },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  tagText: { fontSize: Typography.tiny, fontWeight: '700', letterSpacing: 0.5 },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.saffron + '22',
    borderWidth: 1,
    borderColor: Colors.saffron + '55',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  featuredText: { fontSize: Typography.tiny, fontWeight: '700', color: Colors.saffron, letterSpacing: 0.5 },
  title: { fontSize: Typography.h3, fontWeight: '700', color: Colors.textPrimary },
  description: { fontSize: Typography.caption, color: Colors.textSecondary, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  playerCount: { fontSize: Typography.caption, color: Colors.textSecondary },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.turquoise + '18',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.turquoise + '40',
  },
  playText: { fontSize: Typography.caption, fontWeight: '700', color: Colors.turquoise },
});

export default GameCard;
