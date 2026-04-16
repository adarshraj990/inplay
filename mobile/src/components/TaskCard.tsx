import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    reward: number;
    current: number;
    target: number;
    isClaimed: boolean;
    icon: string;
  };
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const isCompleted = task.current >= task.target;
  const progress = Math.min(task.current / task.target, 1);

  return (
    <View style={[styles.card, task.isClaimed && styles.cardClaimed]}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Ionicons name={task.icon as any} size={22} color={Colors.turquoise} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
        <View style={styles.rewardBox}>
          <Ionicons name="sparkles" size={12} color={Colors.saffron} />
          <Text style={styles.rewardText}>+{task.reward}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressStatus}>
            {isCompleted ? 'Completed' : 'In Progress'}
          </Text>
          <Text style={styles.progressText}>
            {task.current}/{task.target}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.actionBtn,
          isCompleted && !task.isClaimed && styles.actionBtnReady,
          task.isClaimed && styles.actionBtnClaimed
        ]}
        disabled={!isCompleted || task.isClaimed}
      >
        <Text style={[
          styles.actionBtnText,
          isCompleted && !task.isClaimed && styles.actionBtnTextReady,
          task.isClaimed && styles.actionBtnTextClaimed
        ]}>
          {task.isClaimed ? 'Claimed' : isCompleted ? 'Claim Reward' : 'Go Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardClaimed: {
    opacity: 0.7,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  info: { flex: 1, gap: 2 },
  title: { fontSize: Typography.body, fontWeight: '700', color: Colors.textPrimary },
  description: { fontSize: Typography.caption, color: Colors.textSecondary },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    gap: 4,
  },
  rewardText: { color: Colors.saffron, fontWeight: '800', fontSize: Typography.caption },
  
  progressSection: { marginTop: Spacing.md, gap: 6 },
  progressBarBg: { height: 6, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.turquoise },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressStatus: { fontSize: Typography.tiny, fontWeight: '600', color: Colors.textMuted },
  progressText: { fontSize: Typography.tiny, fontWeight: '700', color: Colors.textSecondary },

  actionBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  actionBtnReady: {
    backgroundColor: Colors.turquoise,
    borderColor: Colors.turquoise,
  },
  actionBtnClaimed: {
    backgroundColor: 'transparent',
    borderColor: Colors.online + '44',
  },
  actionBtnText: { color: Colors.textSecondary, fontWeight: '800', fontSize: Typography.caption },
  actionBtnTextReady: { color: Colors.surface },
  actionBtnTextClaimed: { color: Colors.online },
});

export default TaskCard;
