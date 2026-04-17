import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated as RNAnimated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withDelay,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// ── Mock Data ──────────────────────────────────────────────────────────────
const ICONS = ['logo-octocat', 'rocket', 'flask', 'planet', 'construct', 'bulb'];
const USERS = ['Cipher', 'Nova', 'Echo', 'Vortex', 'Quark', 'Nexus'];

const SpyLobby: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [readyCount, setReadyCount] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [isGameStarting, setIsGameStarting] = useState(false);

  // Simulation: Players joining/readying up
  useEffect(() => {
    const timer = setInterval(() => {
      setReadyCount(prev => {
        if (prev < 6) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (readyCount === 6) {
      setIsGameStarting(true);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigation.replace('RoleAssignment');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [readyCount, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.deepBlue]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* ── Background Decoration ── */}
      <View style={styles.circuitLayer}>
        <Ionicons name="git-branch-outline" size={400} color="rgba(0, 212, 200, 0.03)" style={styles.circuit1} />
        <Ionicons name="grid-outline" size={300} color="rgba(0, 212, 200, 0.02)" style={styles.circuit2} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.lobbyId}>ROOM: #SPY99</Text>
          <Text style={styles.title}>Who is the Spy?</Text>
          <Text style={styles.subtitle}>
            {readyCount < 6 
              ? `Waiting for players... (${readyCount}/6)` 
              : 'Protocol Initialized. Prepare for briefing.'}
          </Text>
        </View>

        {/* ── Player Grid (2x3) ── */}
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <PlayerSlot 
              key={idx} 
              index={idx}
              isReady={idx < readyCount}
              username={idx < readyCount ? USERS[idx] : 'Connecting...'}
              iconName={ICONS[idx]}
              isHost={idx === 0}
            />
          ))}
        </View>

        {/* ── Countdown Area ── */}
        <View style={styles.countdownContainer}>
          {isGameStarting ? (
            <View style={styles.timerWrapper}>
              <Text style={styles.startingText}>GAME STARTING IN</Text>
              <Text style={styles.timerValue}>
                {countdown < 10 ? `0${countdown}` : countdown}
              </Text>
              <View style={styles.progressTrack}>
                <AnimatedProgressBar progress={countdown / 10} />
              </View>
            </View>
          ) : (
            <View style={styles.waitingContainer}>
              <ActivityDot delay={0} />
              <ActivityDot delay={400} />
              <ActivityDot delay={800} />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────

const PlayerSlot = ({ index, isReady, username, iconName, isHost }: any) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (isReady) {
      scale.value = withTiming(1, { duration: 500, easing: Easing.back(1.5) });
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [isReady]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.slotContainer, animatedStyle]}>
      <View style={[styles.avatarCircle, isReady && styles.readyCircle, isHost && styles.hostCircle]}>
        <Ionicons 
          name={isReady ? (iconName as any) : 'help-circle-outline'} 
          size={32} 
          color={isReady ? (isHost ? Colors.saffron : Colors.turquoise) : Colors.textMuted} 
        />
        {isHost && (
          <View style={styles.crownContainer}>
            <Ionicons name="star" size={10} color="white" />
          </View>
        )}
      </View>
      <Text style={[styles.userName, isReady && styles.readyName]}>{username}</Text>
      {isReady && <View style={styles.readyBadge}><Text style={styles.readyText}>READY</Text></View>}
    </Animated.View>
  );
};

const ActivityDot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.2);
  useEffect(() => {
    opacity.value = withRepeat(withDelay(delay, withTiming(1, { duration: 600 })), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, style]} />;
};

const AnimatedProgressBar = ({ progress }: { progress: number }) => {
  const widthVal = useSharedValue(100);
  useEffect(() => {
    widthVal.value = withTiming(progress * 100, { duration: 1000 });
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    width: `${widthVal.value}%`,
  }));

  return <Animated.View style={[styles.progressBar, style]} />;
};

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.xl, justifyContent: 'space-between' },
  
  circuitLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  circuit1: { position: 'absolute', top: -50, left: -100, transform: [{ rotate: '45deg' }] },
  circuit2: { position: 'absolute', bottom: -50, right: -100 },

  header: { alignItems: 'center', marginTop: Spacing.lg },
  lobbyId: { color: Colors.turquoise, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  title: { color: Colors.textPrimary, fontSize: Typography.hero, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.body, marginTop: 8, opacity: 0.8 },

  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: Spacing.xl,
    marginVertical: Spacing.xxl
  },
  slotContainer: { width: (width - 100) / 3, alignItems: 'center', gap: Spacing.sm },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card
  },
  readyCircle: { borderColor: Colors.turquoise, backgroundColor: 'rgba(0, 212, 200, 0.1)' },
  hostCircle: { borderColor: Colors.saffron, backgroundColor: 'rgba(255, 159, 28, 0.1)' },
  crownContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.saffron,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background
  },
  userName: { color: Colors.textMuted, fontSize: Typography.caption, fontWeight: '600' },
  readyName: { color: Colors.textPrimary },
  readyBadge: { backgroundColor: 'rgba(0, 212, 200, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  readyText: { color: Colors.turquoise, fontSize: 8, fontWeight: '900' },

  countdownContainer: { height: 120, alignItems: 'center', justifyContent: 'center' },
  timerWrapper: { alignItems: 'center', gap: 4 },
  startingText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  timerValue: { 
    color: Colors.turquoise, 
    fontSize: 64, 
    fontWeight: '900', 
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: Colors.turquoise,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15
  },
  progressTrack: { width: 200, height: 4, backgroundColor: 'rgba(0, 212, 200, 0.1)', borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  progressBar: { height: '100%', backgroundColor: Colors.turquoise },

  waitingContainer: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.turquoise },
});

export default SpyLobby;
