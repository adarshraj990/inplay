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
import { CONFIG } from '../config';
import * as Haptics from 'expo-haptics';

type GamePhase = 'LOBBY' | 'REVEAL' | 'PLAYING' | 'VOTING' | 'RESULT';

// ── Player Interface ───────────────────────────────────────────────────────
interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isEliminated?: boolean;
}

const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Adarsh', avatar: 'https://i.pravatar.cc/150?u=1', isHost: true },
  { id: '2', name: 'Riya', avatar: 'https://i.pravatar.cc/150?u=2', isHost: false },
  { id: '3', name: 'Krish', avatar: 'https://i.pravatar.cc/150?u=3', isHost: false },
  { id: '4', name: 'Zoya', avatar: 'https://i.pravatar.cc/150?u=4', isHost: false },
  { id: '5', name: 'Aryan', avatar: 'https://i.pravatar.cc/150?u=5', isHost: false },
  { id: '6', name: 'Ishani', avatar: 'https://i.pravatar.cc/150?u=6', isHost: false },
  { id: '7', name: 'Kabir', avatar: 'https://i.pravatar.cc/150?u=7', isHost: false },
  { id: '8', name: 'Mira', avatar: 'https://i.pravatar.cc/150?u=8', isHost: false },
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
    startGame: triggerStart,
    castVote: triggerVote
  } = useWhoIsSpyGame('SPY99', '1'); // Mock session/user ID

  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [profileVisible, setProfileVisible] = useState(false);

  const [isHost] = useState(true);

  const startGame = useCallback(() => {
    triggerStart(MOCK_PLAYERS.map(p => p.id));
  }, [triggerStart]);

  const handleVote = (targetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    triggerVote(targetId);
  };

  const {
    skipTurn
  } = useWhoIsSpyGame('SPY99', '1');

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
          {phase === 'VOTING' ? (
            <VotingPhase 
              players={MOCK_PLAYERS.map(p => ({ ...p, isEliminated: livePlayers.find(lp => lp.userId === p.id)?.isAlive === false }))} 
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
                  {phase === 'LOBBY' ? 'Waiting for Players' : 'Participants'} ({livePlayers.length || MOCK_PLAYERS.length}/8)
                </Text>
                <View style={styles.playerGrid}>
                  {MOCK_PLAYERS.map(player => {
                    const liveData = livePlayers.find(p => p.userId === player.id);
                    const isAlive = liveData ? liveData.isAlive : true;
                    const isSpeaking = currentSpeakerId === player.id;

                    return (
                      <TouchableOpacity 
                        key={player.id} 
                        style={[styles.playerItem, !isAlive && styles.eliminated]}
                        onPress={() => {
                          const live = livePlayers.find(p => p.userId === player.id);
                          setSelectedPlayer({ 
                            ...player, 
                            level: live?.level, 
                            xp: live?.xp 
                          });
                          setProfileVisible(true);
                        }}
                      >
                        <View style={[styles.avatarWrapper, isSpeaking && styles.speakingAvatar]}>
                          {isSpeaking && <SpeakingRipple />}
                          <PlayerAvatarWithEmote 
                            userId={player.id}
                            avatarUrl={player.avatar}
                            isHost={player.isHost}
                          />
                        </View>
                        <View style={styles.nameRow}>
                          <Text style={[styles.playerName, isSpeaking && styles.speakingName]}>
                            {player.name}
                          </Text>
                          {liveData?.level && (
                            <View style={styles.inlineLevel}>
                              <Text style={styles.inlineLevelText}>L{liveData.level}</Text>
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
