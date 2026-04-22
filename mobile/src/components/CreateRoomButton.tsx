import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface CreateRoomButtonProps {
  onPress?: () => void;
  label?: string;
  style?: ViewStyle;
}

// ── DISABLED: Create Room crashes during current testing phase ────────────────
// Re-enable by setting IS_DISABLED = false once the crash is fixed.
const IS_DISABLED = true;

const CreateRoomButton: React.FC<CreateRoomButtonProps> = ({
  onPress,
  label = 'Create a Room',
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    if (IS_DISABLED) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }),
      Animated.timing(glow,  { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  };
  const pressOut = () => {
    if (IS_DISABLED) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.timing(glow,  { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  const shadowRadius = glow.interpolate({ inputRange: [0, 1], outputRange: [8, 24] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.75] });

  return (
    <Animated.View
      style={[
        styles.shadow,
        style,
        IS_DISABLED && styles.shadowDisabled,
        { transform: [{ scale }] as any, shadowRadius, shadowOpacity },
      ]}
    >
      <TouchableOpacity
        activeOpacity={IS_DISABLED ? 1 : 0.85}
        onPress={IS_DISABLED ? undefined : onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={IS_DISABLED}
        style={styles.touchable}
      >
        <LinearGradient
          colors={IS_DISABLED ? ['#4A4A5A', '#3A3A4A'] : Colors.gradientSaffron}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Ionicons name="add-circle" size={22} color={IS_DISABLED ? 'rgba(255,255,255,0.35)' : '#fff'} />
          <Text style={[styles.label, IS_DISABLED && styles.labelDisabled]}>
            {label}
          </Text>
          {IS_DISABLED ? (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    borderRadius: Radius.lg,
    shadowColor: Colors.saffron,
    shadowOffset: { width: 0, height: 4 },
    elevation: 14,
  },
  shadowDisabled: {
    shadowColor: '#000',
    elevation: 2,
  },
  touchable: { borderRadius: Radius.lg, overflow: 'hidden' },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: Typography.h3,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  labelDisabled: {
    color: 'rgba(255,255,255,0.35)',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default CreateRoomButton;
