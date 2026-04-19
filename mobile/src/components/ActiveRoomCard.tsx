import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface ActiveRoomCardProps {
  roomName: string;
  game: string;
  host: string;
  players: number;
  maxPlayers: number;
  isLive?: boolean;
  onJoin?: () => void;
}

const ActiveRoomCard: React.FC<ActiveRoomCardProps> = ({
  roomName, game, host, players, maxPlayers, isLive = true, onJoin,
}) => {
  const isFull = players >= maxPlayers;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={!isFull ? onJoin : undefined} style={styles.wrapper}>
      <LinearGradient
        colors={['#16213E', '#0D0D1A']}
        style={styles.card}
      >
        {/* Live indicator */}
        {isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}

        <View style={styles.main}>
          <View style={styles.info}>
            <Text style={styles.roomName} numberOfLines={1}>{roomName}</Text>
            <Text style={styles.game}>{game}</Text>
            <View style={styles.hostRow}>
              <Ionicons name="person-circle" size={14} color={Colors.turquoise} />
              <Text style={styles.host}>{host}</Text>
            </View>
          </View>

          <View style={styles.right}>
            {/* Player count meter */}
            <View style={styles.playerCount}>
              <Ionicons name="people" size={14} color={Colors.textSecondary} />
              <Text style={styles.playerText}>{players}/{maxPlayers}</Text>
            </View>
            <View style={styles.meterBg}>
              <View style={[styles.meterFill, { width: `${(players / maxPlayers) * 100}%` as any, backgroundColor: isFull ? Colors.danger : Colors.turquoise }]} />
            </View>

            {/* Join button */}
            {!isFull ? (
              <TouchableOpacity onPress={onJoin} style={styles.joinBtn}>
                <LinearGradient colors={Colors.gradientTurquoise} style={styles.joinGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.joinText}>Join</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.fullBtn}>
                <Text style={styles.fullText}>Full</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  card: { padding: Spacing.md, position: 'relative' },
  liveBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger + '22',
    borderWidth: 1,
    borderColor: Colors.danger + '55',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  liveText: { fontSize: Typography.tiny, fontWeight: '800', color: Colors.danger },
  main: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1, gap: 3 },
  roomName: { fontSize: Typography.body, fontWeight: '700', color: Colors.textPrimary },
  game: { fontSize: Typography.caption, color: Colors.turquoise, fontWeight: '600' },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  host: { fontSize: Typography.caption, color: Colors.textSecondary },
  right: { alignItems: 'flex-end', gap: Spacing.xs, minWidth: 80 },
  playerCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  playerText: { fontSize: Typography.caption, color: Colors.textSecondary },
  meterBg: { width: 72, height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: 2, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 2 },
  joinBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  joinGrad: { paddingVertical: 5, paddingHorizontal: Spacing.md },
  joinText: { fontSize: Typography.caption, fontWeight: '700', color: Colors.surface },
  fullBtn: {
    backgroundColor: Colors.surfaceBorder,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  fullText: { fontSize: Typography.caption, fontWeight: '700', color: Colors.textMuted },
});

export default ActiveRoomCard;
