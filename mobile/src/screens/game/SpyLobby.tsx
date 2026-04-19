import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated as RNAnimated, Easing, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

import { useWhoIsSpyGame } from '../../hooks/useWhoIsSpyGame';
import { Share } from 'react-native';

const { width } = Dimensions.get('window');

// ── Mock Visuals (Will be replaced by real avatars later) ───────────────────
const ICONS = ['logo-octocat', 'rocket', 'flask', 'planet', 'construct', 'bulb'];
const USERS = ['Cipher', 'Nova', 'Rex', 'Echo', 'Viper', 'Ghost'];

const SpyLobby: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { phase, timer, players, simulateBots } = useWhoIsSpyGame('SPY99', '1'); // Session ID #SPY99
  
  const readyCount = players.length;
  const countdown = timer;
  const isGameStarting = phase === 'LOBBY' && readyCount === 6 && countdown > 0;

  const onShare = async () => {
    try {
      await Share.share({
        message: `Join my Indplay 'Who is Spy?' room! Room ID: #SPY99 🎭`,
      });
    } catch (error) {
      console.log('Share failed', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
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
        {/* ── Fancy Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text style={styles.lobbyTitle}>Who is Spy?</Text>
            <TouchableOpacity onPress={onShare} style={styles.roomRow}>
              <Text style={styles.roomId}>ROOM: #SPY99</Text>
              <Ionicons name="share-outline" size={14} color={Colors.turquoise} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
            {__DEV__ && (
              <TouchableOpacity onPress={simulateBots} style={styles.debugBtn}>
                <Ionicons name="bug-outline" size={20} color={Colors.saffron} />
              </TouchableOpacity>
            )}
          </View>
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

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md },
  backBtn: { padding: 8 },
  headerTextCol: { alignItems: 'center' },
  lobbyTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  roomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  roomId: { fontSize: 12, color: Colors.turquoise, fontWeight: '700', letterSpacing: 1, marginRight: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  settingsBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  debugBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

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
