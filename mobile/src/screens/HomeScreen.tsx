import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet,
  StatusBar, Animated, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { CONFIG } from '../config';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';
import CreateRoomButton from '../components/CreateRoomButton';
import ActiveRoomCard from '../components/ActiveRoomCard';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.3], extrapolate: 'clamp' });
  const { user } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(user);
  const [stats, setStats] = useState({ onlineCount: 0, activeRoomsCount: 0 });
  const [rooms, setRooms] = useState<any[]>([]);

  // ── Data Fetching ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Run in parallel
        const [profRes, statsRes, roomsRes] = await Promise.all([
          apiService.get(CONFIG.ENDPOINTS.USER_PROFILE),
          apiService.get(CONFIG.ENDPOINTS.STATS).catch(() => ({ data: { data: { onlineCount: 0, activeRoomsCount: 0 } } })),
          apiService.get(CONFIG.ENDPOINTS.ROOMS).catch(() => ({ data: { data: [] } }))
        ]);

        if (profRes.data?.success) setProfile(profRes.data.data);
        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (roomsRes.data?.success) setRooms(roomsRes.data.data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const claimDaily = async () => {
    try {
      const response = await apiService.post(CONFIG.ENDPOINTS.DAILY_REWARD);
      if (response.data.success) {
        Alert.alert('🎁 Daily Bonus', 'You received 5 coins for opening Indplay today!');
      }
    } catch (e) {}
  };

  const greeting = () => {
    const h = new Date().getHours();
    const name = profile?.displayName || profile?.username || user?.displayName || user?.username || 'Welcome!';
    const prefix = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    
    return name === 'Welcome!' ? name : `${prefix}, ${name}`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <Animated.View style={[styles.heroBg, { opacity: heroOpacity }]} pointerEvents="none">
        <LinearGradient
          colors={['#0F3460AA', '#0D0D1A00'] as string[]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.appBar}>
        <Text style={styles.brandName}>Indplay</Text>
        <TouchableOpacity 
          style={styles.profileBtn} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={32} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.heroSection}>
          <Text style={styles.greeting}>{greeting()} 👋</Text>
          <Text style={styles.heroSub}>Ready to play? Pick a game or jump into a room.</Text>

          <View style={styles.statsRow}>
            <StatChip icon="people" value={stats.onlineCount.toString()} label="Online" color={Colors.online} />
            <StatChip icon="game-controller" value={stats.activeRoomsCount.toString()} label="Active Rooms" color={Colors.turquoise} />
            <StatChip icon="trophy" value={`#${profile?.rank || '??'}`} label="Your Rank" color={Colors.saffron} />
          </View>
        </View>

        <View style={styles.section}>
          <CreateRoomButton onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Discover Games" linkLabel="See all" />
          <GameCard
            title="Who is Spy?"
            description="One player gets a different word. Discuss, debate, and deduce — but don't blow your cover!"
            icon="eye-off"
            playerCount="4–8"
            tag="SOCIAL"
            tagColor={Colors.turquoise}
            onPress={() => navigation.navigate('WhoIsSpyRoom')}
            featured
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Active Rooms" linkLabel="View all" />
          {loading ? (
            <ActivityIndicator color={Colors.turquoise} style={{ marginVertical: 20 }} />
          ) : rooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cafe-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No active rooms right now.</Text>
              <Text style={styles.emptySub}>Why not create one yourself?</Text>
            </View>
          ) : (
            rooms.map((room: any) => (
              <ActiveRoomCard
                key={room.id}
                roomName={room.roomName}
                game={room.game}
                host={room.host}
                players={room.players}
                maxPlayers={room.maxPlayers}
                isLive={room.isLive}
                onJoin={() => {}}
              />
            ))
          )}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}
const StatChip: React.FC<StatChipProps> = ({ icon, value, label, color }) => (
  <View style={[statStyles.chip, { borderColor: color + '33' }]}>
    <Ionicons name={icon} size={14} color={color} />
    <Text style={[statStyles.value, { color }]}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);
const statStyles = StyleSheet.create({
  chip: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
  },
  value: { fontSize: Typography.body, fontWeight: '800' },
  label: { fontSize: Typography.tiny, color: Colors.textMuted, fontWeight: '600' },
});

interface SectionHeaderProps { title: string; linkLabel?: string; }
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, linkLabel }) => (
  <View style={hdrStyles.row}>
    <Text style={hdrStyles.title}>{title}</Text>
    {linkLabel && (
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={hdrStyles.link}>{linkLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);
const hdrStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  title: { fontSize: Typography.h3, fontWeight: '700', color: Colors.textPrimary },
  link: { fontSize: Typography.caption, fontWeight: '600', color: Colors.turquoise },
});

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder + '66',
  },
  brandName: { fontSize: Typography.h2, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 0.5 },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingHorizontal: Spacing.md },
  heroSection: { paddingTop: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm },
  greeting: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  heroSub: { fontSize: Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  section: { marginBottom: Spacing.lg },
  
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: Typography.body, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: Typography.caption, color: Colors.textMuted },
});

export default HomeScreen;
