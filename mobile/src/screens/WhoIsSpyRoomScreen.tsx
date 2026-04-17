import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Image,
  Dimensions, Animated as RNAnimated, Easing, Alert
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { WORD_BANK, WordPair } from '../constants/gameData';
import RevealCard from '../components/game/RevealCard';
import VotingPhase from '../components/game/VotingPhase';
import GameResultOverlay from '../components/game/GameResultOverlay';
import PlayerAvatarWithEmote from '../components/PlayerAvatarWithEmote';
import EmoteTray from '../components/EmoteTray';
import PlayerProfileModal from '../components/game/PlayerProfileModal';
import { useWhoIsSpyGame } from '../hooks/useWhoIsSpyGame';
import { useAgoraVoice } from '../hooks/useAgoraVoice';
import { CONFIG } from '../config';
import * as Haptics from 'expo-haptics';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type GamePhase = 'LOBBY' | 'REVEAL' | 'PLAYING' | 'VOTING' | 'RESULT';

// ── Player Interface ───────────────────────────────────────────────────────
interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isEliminated?: boolean;
}

const AVATARS = [
  'https://i.pravatar.cc/150?u=1',
  'https://i.pravatar.cc/150?u=2',
  'https://i.pravatar.cc/150?u=3',
  'https://i.pravatar.cc/150?u=4',
  'https://i.pravatar.cc/150?u=5',
  'https://i.pravatar.cc/150?u=6',
];

const WhoIsSpyRoomScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { 
    phase, 
    timer, 
    currentSpeakerId, 
    players: livePlayers, 
    winner, 
    myRole, 
    myWord,
    agoraToken,
    channelName,
    startGame: triggerStart,
    castVote: triggerVote,
    skipTurn: triggerSkip
  } = useWhoIsSpyGame('SPY99', '1'); // Mock session/user ID

  // ── Integrate Turn-Based Voice ──────────────────────
  useAgoraVoice('1', agoraToken, channelName, phase, currentSpeakerId);

  const [profileVisible, setProfileVisible] = useState(false);
  const [isHost] = useState(true);
  const [bannerText, setBannerText] = useState<string | null>(null);

  // ── Handle Phase Transitions (UX) ──────────────────
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (phase === 'DISCUSSION') setBannerText('DISCUSSION START');
    else if (phase === 'VOTING') setBannerText('VOTING OPEN');
    else if (phase === 'RESULT') setBannerText('GAME OVER');
    else setBannerText(null);

    if (phase !== 'LOBBY') {
      const timer = setTimeout(() => {
        setBannerText(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const startGame = useCallback(() => {
    // Collect all valid player IDs from live players
    const userIds = livePlayers.map(p => p.userId);
    triggerStart(userIds);
  }, [triggerStart, livePlayers]);

  const handleVote = (targetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    triggerVote(targetId);
  };

  const skipTurn = useCallback(() => {
    triggerSkip();
  }, [triggerSkip]);

  const resetGame = useCallback(() => {
    // If we want to stay in lobby instead of leaving
    // The useWhoIsSpyGame hook will handle the state reset when phase becomes LOBBY
    console.log('🔄 Match reset requested...');
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (isHost) {
      triggerStart(MOCK_PLAYERS.map(p => p.id));
    }
  }, [isHost, triggerStart]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        
        {/* ── Custom Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Who is Spy?</Text>
            <View style={styles.roomBadge}>
              <Text style={styles.roomText}>ROOM ID: #SPY99</Text>
            </View>
          </View>
          <TouchableOpacity onPress={resetGame} style={styles.resetBtn}>
            <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          {bannerText && (
            <View style={styles.bannerOverlay}>
              <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0)']} style={styles.bannerBg}>
                <Text style={styles.bannerText}>{bannerText}</Text>
              </LinearGradient>
            </View>
          )}

          {phase === 'VOTING' ? (
            <VotingPhase 
              players={livePlayers.map((p, idx) => ({ 
                id: p.userId, 
                name: p.userId === '1' ? 'You' : `Player ${idx + 1}`,
                avatar: AVATARS[idx % AVATARS.length],
                isHost: idx === 0,
                isEliminated: !p.isAlive
              }))} 
              myId="1" 
              onVote={handleVote} 
            />
          ) : (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* ── Timer Banner ── */}
              {timer > 0 && (
                <View style={styles.timerBanner}>
                  <Ionicons name="timer-outline" size={16} color={Colors.turquoise} />
                  <Text style={styles.timerText}>{timer}s remaining</Text>
                </View>
              )}

              {/* ── Game Area ── */}
              <View style={styles.gameArea}>
                <RevealCard word={myWord} role={myRole || 'Citizen'} gameStarted={phase !== 'LOBBY'} />
              </View>

              {/* ── Player List ── */}
              <View style={styles.playersSection}>
                <Text style={styles.sectionTitle}>
                  {phase === 'LOBBY' ? 'Waiting for Players' : 'Participants'} ({livePlayers.length}/6)
                </Text>
                <View style={styles.playerGrid}>
                  {livePlayers.map((player, idx) => {
                    const isAlive = player.isAlive;
                    const isSpeaking = currentSpeakerId === player.userId;
                    const name = `Player ${idx + 1}`; 

                    return (
                      <TouchableOpacity 
                        key={player.userId} 
                        style={[styles.playerItem, !isAlive && styles.eliminated]}
                        onPress={() => {
                          setSelectedPlayer({ 
                            id: player.userId,
                            name, 
                            avatar: AVATARS[idx % AVATARS.length],
                            level: player.level, 
                            xp: player.xp 
                          });
                          setProfileVisible(true);
                        }}
                      >
                        <View style={[styles.avatarWrapper, isSpeaking && styles.speakingAvatar]}>
                          {isSpeaking && <SpeakingRipple />}
                          <PlayerAvatarWithEmote 
                            userId={player.userId}
                            avatarUrl={AVATARS[idx % AVATARS.length]}
                            isHost={idx === 0}
                          />
                          {isSpeaking && (
                            <View style={styles.micIconContainer}>
                              <Ionicons name="mic" size={12} color="white" />
                            </View>
                          )}
                        </View>
                        <View style={styles.nameRow}>
                          <Text style={[styles.playerName, isSpeaking && styles.speakingName]}>
                            {player.userId === '1' ? 'You' : name}
                          </Text>
                          {player.level && (
                            <View style={styles.inlineLevel}>
                              <Text style={styles.inlineLevelText}>L{player.level}</Text>
                            </View>
                          )}
                        </View>
                        {!isAlive && <View style={styles.eliminatedTag}><Text style={styles.eliminatedText}>OUT</Text></View>}
                        {isSpeaking && <View style={styles.speakingBadge}><Text style={styles.speakingBadgeText}>TALKING</Text></View>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          )}
        </View>

        <EmoteTray sessionId="SPY99" gameType="whoisspy" />

        {/* ── Action Footer ── */}
        <View style={styles.footer}>
          {phase === 'LOBBY' && isHost ? (
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <LinearGradient colors={Colors.gradientSaffron} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                <Text style={styles.btnText}>Start Game</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>
                {phase === 'REVEAL' ? 'Memorize your word!' :
                 phase === 'DISCUSSION' ? (currentSpeakerId === '1' ? 'IT IS YOUR TURN TO TALK' : 'Listen to other players...') :
                 phase === 'VOTING' ? 'Cast your vote now!' : 
                 'Game in progress'}
              </Text>
              {phase === 'DISCUSSION' && currentSpeakerId === '1' && (
                <TouchableOpacity style={styles.skipTurnBtn} onPress={skipTurn}>
                  <Text style={styles.skipTurnText}>Skip Turn</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ── Overlays ── */}
        {phase === 'RESULT' && (
          <GameResultOverlay 
            votedPlayer={null}
            winner={winner}
            onContinue={resetGame}
            onRestart={handlePlayAgain}
          />
        )}

        <PlayerProfileModal 
          visible={profileVisible}
          onClose={() => setProfileVisible(false)}
          player={selectedPlayer}
          onReport={async (id) => {
            try {
              const response = await fetch(CONFIG.ENDPOINTS.REPORTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportedId: id, reason: 'Reported via room profile', context: 'SPY99' })
              });
              const data = await response.json();
              if (data.success) {
                setProfileVisible(false);
                Alert.alert('Reported', 'Thank you for your report. We will investigate.');
              }
            } catch (e) {
              console.log('Report failed', e);
            }
          }}
          onBlock={(id) => {
            Alert.alert('Blocked', 'This player has been blocked.');
            setProfileVisible(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: Typography.h3, fontWeight: '800', color: Colors.textPrimary },
  roomBadge: { backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.sm, marginTop: 2 },
  roomText: { fontSize: 10, fontWeight: '700', color: Colors.turquoise, letterSpacing: 0.5 },
  resetBtn: { width: 40, height: 40, alignItems: 'flex-end', justifyContent: 'center' },

  content: { paddingBottom: Spacing.xxl },
  gameArea: { height: 500, alignItems: 'center', justifyContent: 'center' },

  playersSection: { paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  sectionTitle: { fontSize: Typography.body, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.md },
  playerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' },
  playerItem: { alignItems: 'center', width: 70, gap: 4 },
  avatarContainer: { width: 56, height: 56, borderRadius: Radius.full, padding: 2, backgroundColor: Colors.surfaceBorder },
  hostAvatar: { backgroundColor: Colors.saffron },
  avatar: { width: '100%', height: '100%', borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.background },
  crownContainer: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.saffron, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background },
  playerName: { fontSize: Typography.caption, color: Colors.textPrimary, fontWeight: '600' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineLevel: { backgroundColor: Colors.surface, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.surfaceBorder },
  inlineLevelText: { fontSize: 8, fontWeight: '900', color: Colors.turquoise },
  speakingName: { color: Colors.turquoise, fontWeight: '900' },
  eliminated: { opacity: 0.4 },
  eliminatedTag: { position: 'absolute', top: 15, backgroundColor: Colors.saffron, paddingHorizontal: 4, borderRadius: 4 },
  eliminatedText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  avatarWrapper: { borderRadius: Radius.full, padding: 3 },
  speakingAvatar: { backgroundColor: Colors.turquoise, elevation: 10, shadowColor: Colors.turquoise, shadowOpacity: 0.5, shadowRadius: 10 },
  speakingBadge: { position: 'absolute', bottom: -12, backgroundColor: Colors.turquoise, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  speakingBadgeText: { color: Colors.background, fontSize: 8, fontWeight: '900' },
  micIconContainer: {
    position: 'absolute',
    top: -2,
    left: -2,
    backgroundColor: Colors.turquoise,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background
  },
  
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  bannerBg: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
  },
  bannerText: {
    color: Colors.turquoise,
    fontSize: Typography.hero,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 212, 200, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },

  timerBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(0, 212, 200, 0.1)', paddingVertical: 8, marginBottom: Spacing.md },
  timerText: { color: Colors.turquoise, fontWeight: '700', fontSize: 14 },

  emptySlot: { width: 56, height: 56, borderRadius: Radius.full, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.surfaceBorder, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: Typography.tiny, color: Colors.textMuted },

  main: { flex: 1 },
  footer: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.lg, backgroundColor: Colors.background },
  startBtn: { height: 56, backgroundColor: Colors.turquoise, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', elevation: 8, overflow: 'hidden' },
  btnGradient: { flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  btnText: { color: '#fff', fontSize: Typography.h3, fontWeight: '800', letterSpacing: 0.5 },
  statusBox: { height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.surfaceBorder },
  statusText: { color: Colors.textSecondary, fontWeight: '600' },
  skipTurnBtn: { position: 'absolute', right: 12, backgroundColor: Colors.saffron, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  skipTurnText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.turquoise,
    top: 0,
    left: 4,
  }
});

const SpeakingRipple = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.6, { duration: 1500 }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.ripple, animatedStyle]} />
  );
};

// Add ripple style
// Removed Object.assign to satisfy TypeScript

export default WhoIsSpyRoomScreen;
