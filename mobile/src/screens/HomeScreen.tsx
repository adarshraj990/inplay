import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, Animated, TouchableOpacity, Image, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { CONFIG } from '../config';
import GameCard from '../components/GameCard';
import CreateRoomButton from '../components/CreateRoomButton';
import ActiveRoomCard from '../components/ActiveRoomCard';

// ── Mock data ────────────────────────────────────────────────────────────────
const ACTIVE_ROOMS = [
  { id: '1', roomName: "Adarsh's Spy Den",  game: "Who is Spy?", host: 'Adarsh',  players: 4, maxPlayers: 6, isLive: true  },
  { id: '2', roomName: 'Midnight Detectives', game: "Who is Spy?", host: 'Riya',   players: 6, maxPlayers: 6, isLive: true  },
  { id: '3', roomName: 'Casual Lobby',        game: "Who is Spy?", host: 'Krish',  players: 2, maxPlayers: 8, isLive: false },
];

// ── Header greeting ──────────────────────────────────────────────────────────
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Parallax for hero gradient
  const heroOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.3], extrapolate: 'clamp' });

  useEffect(() => {
    const claimDaily = async () => {
      try {
        const response = await fetch(CONFIG.ENDPOINTS.DAILY_REWARD, {
          method: 'POST'
        });
        const data = await response.json();
        if (data.success) {
          Alert.alert('🎁 Daily Bonus', 'You received 5 coins for opening Indplay today!');
        }
      } catch (e) {
        // Silent fail for background tasks
      }
    };
    claimDaily();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* ── Ambient gradient bg ── */}
      <Animated.View style={[styles.heroBg, { opacity: heroOpacity }]} pointerEvents="none">
        <LinearGradient
          colors={['#0F3460AA', '#0D0D1A00']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* ── Top App Bar ── */}
      <View style={styles.appBar}>
        <Text style={styles.brandName}>Indplay</Text>
        <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
          <Ionicons name="person-circle" size={32} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* ── Greeting hero ── */}
        <View style={styles.heroSection}>
          <Text style={styles.greeting}>{greeting()}, Adarsh 👋</Text>
          <Text style={styles.heroSub}>Ready to play? Pick a game or jump into a room.</Text>

          {/* Online stats row */}
          <View style={styles.statsRow}>
            <StatChip icon="people" value="1.2K" label="Online" color={Colors.online} />
            <StatChip icon="game-controller" value="38"  label="Active Rooms" color={Colors.turquoise} />
            <StatChip icon="trophy"          value="#12" label="Your Rank" color={Colors.saffron} />
          </View>
        </View>

        {/* ── Create Room CTA ── */}
        <View style={styles.section}>
          <CreateRoomButton onPress={() => {}} />
        </View>

        {/* ── Discover Games ── */}
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

        {/* ── More Games ── */}
        <View style={styles.section}>
          <SectionHeader title="More Games" linkLabel="Browse" />
          <GameCard
            title="Coming Soon"
            description="New games are on the way. Stay tuned for more wild party experiences!"
            icon="rocket"
            playerCount="2–10"
            tag="UPCOMING"
            tagColor={Colors.saffron}
          />
        </View>

        {/* ── Active Rooms ── */}
        <View style={styles.section}>
          <SectionHeader title="Active Rooms" linkLabel="View all" />
          {ACTIVE_ROOMS.map((room) => (
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
          ))}
        </View>

        {/* Bottom spacer for tab bar */}
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  logoPill: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default HomeScreen;
