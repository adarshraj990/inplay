import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface CreateRoomButtonProps {
  onPress?: () => void;
  label?: string;
  style?: ViewStyle;
}

const CreateRoomButton: React.FC<CreateRoomButtonProps> = ({
  onPress,
  label = 'Create a Room',
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }),
      Animated.timing(glow,  { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  };
  const pressOut = () => {
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
        { transform: [{ scale }], shadowRadius, shadowOpacity },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.touchable}
      >
        <LinearGradient
          colors={Colors.gradientSaffron}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.label}>{label}</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
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
});

export default CreateRoomButton;
