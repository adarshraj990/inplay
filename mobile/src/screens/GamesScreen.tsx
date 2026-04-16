import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

const GAMES = [
  { id: '1', title: "Who is Spy?",    icon: 'eye-off',     tag: 'LIVE',     players: '4–8',  color: Colors.turquoise },
  { id: '2', title: 'Coming Soon',    icon: 'rocket',      tag: 'SOON',     players: '2–10', color: Colors.saffron   },
  { id: '3', title: 'Coming Soon',    icon: 'flash',       tag: 'SOON',     players: '3–6',  color: '#A78BFA'        },
];

const GamesScreen: React.FC = () => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}>
      <Text style={styles.title}>Games</Text>
      <Text style={styles.sub}>Pick your battle.</Text>
    </View>
    <FlatList
      data={GAMES}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.85} style={styles.card}>
          <LinearGradient colors={['#16213E', '#0D0D1A']} style={styles.cardInner}>
            <LinearGradient colors={[item.color + '44', item.color + '11']} style={styles.iconBox}>
              <Ionicons name={item.icon as any} size={34} color={item.color} />
            </LinearGradient>
            <View style={styles.infoBox}>
              <View style={[styles.tag, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
                <Text style={[styles.tagText, { color: item.color }]}>{item.tag}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.playerRow}>
                <Ionicons name="people" size={14} color={Colors.textSecondary} />
                <Text style={styles.players}>{item.players} players</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  card: { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.surfaceBorder },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  iconBox: { width: 64, height: 64, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  infoBox: { flex: 1, gap: 4 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  tagText: { fontSize: Typography.tiny, fontWeight: '700' },
  cardTitle: { fontSize: Typography.h3, fontWeight: '700', color: Colors.textPrimary },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  players: { fontSize: Typography.caption, color: Colors.textSecondary },
});

export default GamesScreen;
