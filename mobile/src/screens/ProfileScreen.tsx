import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { CONFIG } from '../config';
import apiService from '../services/apiService';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(CONFIG.ENDPOINTS.USER_PROFILE);
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const stats = [
    { label: 'Level',         value: user?.level?.toString() || '1',   icon: 'star',            color: Colors.saffron   },
    { label: 'XP',            value: user?.xp?.toString() || '0',       icon: 'trending-up',     color: Colors.turquoise },
    { label: 'Coins',         value: user?.coins?.toString() || '0',    icon: 'cash-outline',     color: Colors.online    },
    { label: 'Games Played',  value: '0',                             icon: 'game-controller', color: '#A78BFA'        },
  ];

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.turquoise} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient colors={['#0F3460', Colors.background] as string[]} style={styles.hero}>
          <LinearGradient colors={Colors.gradientTurquoise} style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.displayName || user?.username || 'A')[0]}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.name}>{user?.displayName || user?.username || 'Indplay User'}</Text>
          <Text style={styles.handle}>@{user?.username || 'username'}</Text>
          
          <View style={styles.uidContainer}>
            <Text style={styles.uidLabel}>UID:</Text>
            <Text style={styles.uidValue}>{user?.gameUid || '--------'}</Text>
            <TouchableOpacity onPress={() => {}} style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={14} color={Colors.turquoise} />
            </TouchableOpacity>
          </View>

          <View style={styles.levelRow}>
            <Ionicons name="star" size={14} color={Colors.saffron} />
            <Text style={styles.level}>Level {user?.level || 1} · {user?.xp || 0} XP</Text>
          </View>
        </LinearGradient>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color + '33' }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            activeOpacity={0.75} 
            style={styles.menuRow}
            onPress={() => navigation.navigate('EditProfile', { initialUser: user })}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.surfaceCard }]}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            </View>
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.75} style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.danger + '18' }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.sm },
  avatarRing: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background },
  avatarText: { fontSize: 36, fontWeight: '800', color: Colors.turquoise },
  name: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  handle: { fontSize: Typography.body, color: Colors.textSecondary },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.saffron + '18', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.saffron + '44' },
  level: { fontSize: Typography.caption, fontWeight: '700', color: Colors.saffron },

  uidContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surfaceCard, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, marginTop: 4 },
  uidLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
  uidValue: { fontSize: 13, fontWeight: '800', color: Colors.turquoise, letterSpacing: 1 },
  copyBtn: { padding: 4 },

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
