import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface GameResultOverlayProps {
  votedPlayer: { name: string, role: string } | null;
  winner: 'Citizens' | 'Spy' | null;
  onContinue: () => void;
  onRestart: () => void;
}

const GameResultOverlay: React.FC<GameResultOverlayProps> = ({ 
  votedPlayer, 
  winner, 
  onContinue, 
  onRestart 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();

    // Infinite pulse for the winner icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const isSpyWin = winner === 'Spy';
  const themeColor = isSpyWin ? Colors.saffron : Colors.turquoise;
  const coinAmount = isSpyWin ? '+5' : '+3';

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={[Colors.surface, 'rgba(26, 26, 46, 0.95)']}
            style={styles.gradientBg}
          >
            {winner ? (
              // ── Winner Circle View ──
              <View style={styles.content}>
                <View style={styles.winnerHeader}>
                  <Text style={styles.victoryLabel}>VICTORY</Text>
                  <View style={styles.divider} />
                </View>

                <Animated.View style={[
                  styles.iconCircle, 
                  { backgroundColor: themeColor, transform: [{ scale: pulseAnim }] }
                ]}>
                  <Ionicons name={isSpyWin ? "skull" : "trophy"} size={70} color="#fff" />
                </Animated.View>

                <Text style={[styles.title, { color: themeColor }]}>
                  {winner.toUpperCase()} WON!
                </Text>
                
                <View style={styles.rewardBadge}>
                  <Ionicons name="flash" size={16} color={Colors.saffron} />
                  <Text style={styles.rewardText}>{coinAmount} COINS</Text>
                </View>

                <Text style={styles.subtitle}>
                  {isSpyWin 
                    ? 'The Spy has successfully infiltrated and dominated.' 
                    : 'The Citizens have neutralized the threat.'}
                </Text>

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: themeColor }]} onPress={onRestart}>
                  <Text style={styles.btnText}>Play Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ── Intermediate Reveal ──
              <View style={styles.content}>
                <Text style={styles.revealLabel}>IDENTIFIED AS...</Text>
                <Text style={[styles.roleText, { color: votedPlayer?.role === 'Spy' ? Colors.saffron : Colors.turquoise }]}>
                  {votedPlayer?.role.toUpperCase()}
                </Text>
                <Text style={styles.outcomeText}>
                  {votedPlayer?.name} has been voting out.
                </Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={onContinue}>
                  <Text style={styles.btnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.xxl, width: width * 0.85, borderWidth: 1, borderColor: Colors.surfaceBorder, overflow: 'hidden', elevation: 20 },
  gradientBg: { padding: Spacing.xl, alignItems: 'center' },
  content: { alignItems: 'center', width: '100%', gap: Spacing.md },
  
  winnerHeader: { alignItems: 'center', marginBottom: Spacing.sm },
  victoryLabel: { fontSize: 14, fontWeight: '900', color: Colors.textMuted, letterSpacing: 4 },
  divider: { width: 40, height: 2, backgroundColor: Colors.surfaceBorder, marginTop: 4 },

  iconCircle: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  
  title: { fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  
  rewardBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 159, 28, 0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 28, 0.3)',
    marginBottom: Spacing.sm
  },
  rewardText: { color: Colors.saffron, fontWeight: '800', fontSize: 12, marginLeft: 4 },

  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  
  revealLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, letterSpacing: 2, marginBottom: Spacing.xs },
  roleText: { fontSize: 48, fontWeight: '900', marginBottom: Spacing.sm },
  outcomeText: { fontSize: Typography.body, color: Colors.textPrimary, marginBottom: Spacing.lg, textAlign: 'center' },
  
  primaryBtn: { width: '100%', height: 56, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});

export default GameResultOverlay;
