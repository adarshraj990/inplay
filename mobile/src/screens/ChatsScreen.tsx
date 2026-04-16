import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

const CHATS = [
  { id: '1', name: 'Adarsh',   last: 'GG! That last round was wild 🔥', time: '2m',  unread: 3, online: true  },
  { id: '2', name: 'Riya',     last: 'Are you the spy?? 🤔',             time: '15m', unread: 0, online: true  },
  { id: '3', name: 'Spy Den',  last: 'Krish: I swear I am not the spy!', time: '1h',  unread: 1, online: false, group: true },
  { id: '4', name: 'Dev',      last: 'Game night at 9?',                 time: '3h',  unread: 0, online: false },
];

const ChatsScreen: React.FC = () => (
  <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}>
      <Text style={styles.title}>Chats</Text>
      <TouchableOpacity style={styles.composeBtn}>
        <LinearGradient colors={Colors.gradientTurquoise} style={styles.composeGrad}>
          <Ionicons name="create" size={18} color={Colors.surface} />
        </LinearGradient>
      </TouchableOpacity>
    </View>

    <FlatList
      data={CHATS}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.75} style={styles.row}>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={item.group ? Colors.gradientSaffron : Colors.gradientTurquoise}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {item.group ? '👥' : item.name[0]}
              </Text>
            </LinearGradient>
            {item.online && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.topRow}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.last} numberOfLines={1}>{item.last}</Text>
              {item.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  composeBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  composeGrad: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: Spacing.xxl },
  sep: { height: 1, backgroundColor: Colors.surfaceBorder + '44', marginLeft: 76 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.md },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: Colors.surface },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 7, backgroundColor: Colors.online, borderWidth: 2, borderColor: Colors.background },
  chatInfo: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  name: { fontSize: Typography.body, fontWeight: '700', color: Colors.textPrimary },
  time: { fontSize: Typography.tiny, color: Colors.textMuted },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  last: { flex: 1, fontSize: Typography.caption, color: Colors.textSecondary },
  badge: { backgroundColor: Colors.turquoise, borderRadius: Radius.full, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, marginLeft: Spacing.sm },
  badgeText: { fontSize: Typography.tiny, fontWeight: '800', color: Colors.surface },
});

export default ChatsScreen;
