import React from 'react';
import { 
  View, Text, StyleSheet, Modal, 
  TouchableOpacity, Image, 
  TouchableWithoutFeedback 
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface PlayerProfileModalProps {
  visible: boolean;
  onClose: () => void;
  player: {
    id: string;
    name: string;
    avatar: string;
    level?: number;
    xp?: number;
  } | null;
  onReport: (id: string) => void;
  onBlock: (id: string) => void;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  visible,
  onClose,
  player,
  onReport,
  onBlock,
}) => {
  if (!player) return null;

  const level = player.level || 1;
  const xp = player.xp || 0;
  const xpProgress = xp % 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.outside}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <BlurView blurAmount={40} style={StyleSheet.absoluteFill} blurType="dark" />
              
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.profileHeader}>
                <Image source={{ uri: player.avatar }} style={styles.avatar} />
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Lvl {level}</Text>
                </View>
                <Text style={styles.name}>{player.name}</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{xpProgress}/100</Text>
                  <Text style={styles.statLabel}>Next Level</Text>
                </View>
                <View style={[styles.statBox, styles.statDivider]}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Wins</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => onReport(player.id)}
                >
                  <Ionicons name="flag-outline" size={20} color={Colors.danger} />
                  <Text style={[styles.actionText, { color: Colors.danger }]}>Report Player</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.blockBtn]}
                  onPress={() => onBlock(player.id)}
                >
                  <Ionicons name="ban-outline" size={20} color={Colors.textSecondary} />
                  <Text style={styles.actionText}>Block Player</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  outside: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modal: { 
    width: '85%', 
    backgroundColor: Colors.surface, 
    borderRadius: Radius.xxl, 
    padding: Spacing.xl, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  closeBtn: { position: 'absolute', top: Spacing.md, right: Spacing.md, zIndex: 1 },
  
  profileHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: Colors.surfaceBorder },
  levelBadge: { 
    marginTop: -15, 
    backgroundColor: Colors.turquoise, 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.surface
  },
  levelText: { color: Colors.background, fontSize: 12, fontWeight: '900' },
  name: { color: Colors.textPrimary, fontSize: Typography.h2, fontWeight: '800', marginTop: Spacing.sm },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: Radius.lg, padding: Spacing.md, width: '100%', marginBottom: Spacing.xl },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderLeftColor: Colors.surfaceBorder },
  statValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },

  actions: { width: '100%', gap: Spacing.sm },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    height: 50, 
    borderRadius: Radius.md,
    gap: 10
  },
  blockBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.surfaceBorder },
  actionText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 14 }
});

export default PlayerProfileModal;
