import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import PlayerAvatarWithEmote from '../PlayerAvatarWithEmote';
import { Ionicons } from '@expo/vector-icons';

interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isEliminated?: boolean;
}

interface VotingPhaseProps {
  players: Player[];
  myId: string;
  onVote: (targetId: string) => void;
}

const VotingPhase: React.FC<VotingPhaseProps> = ({ players, myId, onVote }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activePlayers = players.filter(p => !p.isEliminated && p.id !== myId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who is the Spy?</Text>
      <Text style={styles.subtitle}>Select a player to vote them out.</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {activePlayers.map(player => (
          <TouchableOpacity
            key={player.id}
            style={[
              styles.playerCard,
              selectedId === player.id && styles.playerCardSelected
            ]}
            onPress={() => setSelectedId(player.id)}
            activeOpacity={0.8}
          >
            <PlayerAvatarWithEmote
              userId={player.id}
              avatarUrl={player.avatar}
              size={64}
              isHost={player.isHost}
            />
            <Text style={styles.playerName}>{player.name}</Text>
            {selectedId === player.id && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.turquoise} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.voteBtn, !selectedId && styles.voteBtnDisabled]}
        disabled={!selectedId}
        onPress={() => selectedId && onVote(selectedId)}
      >
        <Text style={styles.voteBtnText}>Confirm Vote</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md, alignItems: 'center' },
  title: { fontSize: Typography.h2, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  playerCard: {
    width: 100,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  playerCardSelected: { borderColor: Colors.turquoise, backgroundColor: 'rgba(0, 212, 200, 0.1)' },
  playerName: { marginTop: 8, fontSize: Typography.caption, fontWeight: '700', color: Colors.textPrimary },
  checkBadge: { position: 'absolute', top: -10, right: -10, backgroundColor: Colors.background, borderRadius: 12 },
  voteBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.turquoise,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  voteBtnDisabled: { backgroundColor: Colors.surface, opacity: 0.5 },
  voteBtnText: { color: '#fff', fontSize: Typography.h3, fontWeight: '800' },
});

export default VotingPhase;
