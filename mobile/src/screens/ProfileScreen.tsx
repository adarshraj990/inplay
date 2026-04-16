import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

const STATS = [
  { label: 'Games Played', value: '142',  icon: 'game-controller', color: Colors.turquoise },
  { label: 'Wins',         value: '61',   icon: 'trophy',          color: Colors.saffron   },
  { label: 'Win Rate',     value: '43%',  icon: 'trending-up',     color: Colors.online    },
  { label: 'Friends',      value: '28',   icon: 'people',          color: '#A78BFA'        },
];

const MENU_ITEMS = [
  { icon: 'person-outline',       label: 'Edit Profile'    },
  { icon: 'shield-checkmark',     label: 'Privacy & Safety'},
  { icon: 'notifications-outline',label: 'Notifications'   },
  { icon: 'color-palette-outline',label: 'Appearance'      },
  { icon: 'help-circle-outline',  label: 'Help & Support'  },
  { icon: 'log-out-outline',      label: 'Sign Out', danger: true },
];

const ProfileScreen: React.FC = () => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* Hero */}
      <LinearGradient colors={['#0F3460', Colors.background]} style={styles.hero}>
        <LinearGradient colors={Colors.gradientTurquoise} style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </LinearGradient>
        <Text style={styles.name}>Adarsh</Text>
        <Text style={styles.handle}>@adarsh_plays</Text>

        <View style={styles.levelRow}>
          <Ionicons name="star" size={14} color={Colors.saffron} />
          <Text style={styles.level}>Level 12 · Spy Master</Text>
        </View>
      </LinearGradient>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {STATS.map((s) => (
          <View key={s.label} style={[styles.statCard, { borderColor: s.color + '33' }]}>
            <Ionicons name={s.icon as any} size={20} color={s.color} />
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map(({ icon, label, danger }) => (
          <TouchableOpacity key={label} activeOpacity={0.75} style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: danger ? Colors.danger + '18' : Colors.surfaceCard }]}>
              <Ionicons name={icon as any} size={20} color={danger ? Colors.danger : Colors.textSecondary} />
            </View>
            <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
            {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.sm },
  avatarRing: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background },
  avatarText: { fontSize: 36, fontWeight: '800', color: Colors.turquoise },
  name: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  handle: { fontSize: Typography.body, color: Colors.textSecondary },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.saffron + '18', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.saffron + '44' },
  level: { fontSize: Typography.caption, fontWeight: '700', color: Colors.saffron },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  statCard: { flex: 1, minWidth: '44%', backgroundColor: Colors.surfaceCard, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, alignItems: 'center', gap: 4 },
  statValue: { fontSize: Typography.h2, fontWeight: '800' },
  statLabel: { fontSize: Typography.tiny, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },

  menuSection: { paddingHorizontal: Spacing.md, gap: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder + '44' },
  menuIcon: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: Typography.body, fontWeight: '600', color: Colors.textPrimary },
});

export default ProfileScreen;
