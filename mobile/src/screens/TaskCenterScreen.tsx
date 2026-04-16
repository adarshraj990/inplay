import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator,
  RefreshControl, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import TaskCard from '../components/TaskCard';

// Dummy implementation for TaskCenterScreen
const TaskCenterScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [coins, setCoins] = useState(0);

  const fetchTasks = async () => {
    // In a real app, this would be an API call
    // Mocking response for now based on backend logic
    setTimeout(() => {
      setTasks([
        {
          id: 'check-in',
          title: 'Daily Check-in',
          description: 'Log in every day to earn rewards',
          reward: 10,
          current: 1,
          target: 1,
          isClaimed: true,
          icon: 'calendar'
        },
        {
          id: 'starter',
          title: 'Starter Gamer',
          description: 'Complete 3 matches in any game',
          reward: 10,
          current: 1,
          target: 3,
          isClaimed: false,
          icon: 'game-controller'
        },
        {
          id: 'pro',
          title: 'Pro Gamer',
          description: 'Complete 5 matches in any game',
          reward: 15,
          current: 1,
          target: 5,
          isClaimed: false,
          icon: 'trophy'
        },
        {
          id: 'social',
          title: 'Social Gamer',
          description: 'Play 2 matches with friends',
          reward: 15,
          current: 0,
          target: 2,
          isClaimed: false,
          icon: 'people'
        }
      ]);
      setCoins(10);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.turquoise} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Task Center</Text>
          <View style={styles.coinBadge}>
            <Ionicons name="sparkles" size={14} color={Colors.saffron} />
            <Text style={styles.coinText}>{coins}</Text>
          </View>
        </View>
        <Text style={styles.sub}>Complete tasks to earn coins and level up.</Text>
      </View>

      {/* ── Progress Overview ── */}
      <View style={styles.overviewContainer}>
        <LinearGradient
          colors={['#1F1F35', '#24243E']}
          style={styles.overviewCard}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Daily Progress</Text>
            <Text style={styles.progressPercent}>{Math.round((coins / 50) * 100)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: `${(coins / 50) * 100}%` }]} />
          </View>
          <Text style={styles.progressFooter}>{coins} / 50 coins earned today</Text>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.turquoise} />
        }
      >
        <Text style={styles.sectionTitle}>Daily Tasks</Text>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
        
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  header: { padding: Spacing.md, gap: 4 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: Typography.body, color: Colors.textSecondary },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 4,
  },
  coinText: { color: Colors.saffron, fontWeight: '700', fontSize: Typography.body },
  overviewContainer: { paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  overviewCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: Spacing.sm,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: Colors.textPrimary, fontWeight: '700', fontSize: Typography.body },
  progressPercent: { color: Colors.turquoise, fontWeight: '800', fontSize: Typography.h3 },
  progressBarBg: { height: 10, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.turquoise },
  progressFooter: { color: Colors.textMuted, fontSize: Typography.caption, textAlign: 'right' },
  scroll: { paddingHorizontal: Spacing.md },
  sectionTitle: { 
    fontSize: Typography.h3, 
    fontWeight: '700', 
    color: Colors.textPrimary, 
    marginTop: Spacing.sm,
    marginBottom: Spacing.md 
  },
  footerSpacer: { height: Spacing.xl },
});

export default TaskCenterScreen;
