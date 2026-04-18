import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface Props {
  onRetry: () => void;
  message?: string;
}

/**
 * Specialized UI for the "Server Warming Up" state.
 * Prevents users from seeing a broken app when Render is waking up.
 */
const WarmingUpScreen: React.FC<Props> = ({ onRetry, message }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <LinearGradient
            colors={Colors.gradientTurquoise}
            style={styles.circle}
          >
            <Ionicons name="power" size={60} color="white" />
          </LinearGradient>
          <View style={styles.pulseContainer}>
            <ActivityIndicator size="small" color={Colors.turquoise} />
          </View>
        </View>

        <Text style={styles.title}>Server is Warming Up</Text>
        <Text style={styles.subtitle}>
          {message || "We're spinning up the game engine for you. This usually takes 15-30 seconds on the first load. Hang tight!"}
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>ENGINE STATUS: INITIALIZING...</Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.surfaceCard, Colors.surfaceBorder]}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.turquoise,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  pulseContainer: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.turquoise,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  statusBox: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xxl,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.turquoise,
    letterSpacing: 2,
  },
  button: {
    width: '60%',
    height: 50,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WarmingUpScreen;
