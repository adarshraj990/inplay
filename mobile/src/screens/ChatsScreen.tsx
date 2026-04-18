import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { CONFIG } from '../config';
import apiService from '../services/apiService';
import { useNotificationStats } from '../hooks/useNotificationStats';

const ChatsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const unreadRequests = useNotificationStats();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(CONFIG.ENDPOINTS.SOCIAL.FRIENDS);
        if (response.data.success) {
          // Map friends to chat format
          const formatted = response.data.data.map((f: any) => ({
            id: f.id,
            name: f.displayName || f.username,
            last: 'Start a conversation...', // Placeholder as we don't have last message logic fully yet
            time: 'Now',
            unread: 0,
            online: f.status !== 'OFFLINE',
            avatar: f.avatarUrl
          }));
          setChats(formatted);
        }
      } catch (error) {
        console.error('Friends fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.requestBtn} 
            onPress={() => navigation.navigate('SocialRequests')}
          >
            <Ionicons name="people-outline" size={22} color={Colors.textSecondary} />
            {unreadRequests > 0 && (
              <View style={styles.requestBadge}>
                <Text style={styles.badgeText}>{unreadRequests}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.composeBtn}>
            <LinearGradient colors={Colors.gradientTurquoise} style={styles.composeGrad}>
              <Ionicons name="create" size={18} color={Colors.surface} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.turquoise} />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color={Colors.surfaceBorder} />
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySub}>Add friends to start chatting!</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
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
                    {item.group ? '👥' : (item.name ? item.name[0] : '?')}
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  requestBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceCard, borderRadius: Radius.sm, position: 'relative' },
  requestBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.saffron, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: Colors.background },
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
  emptyText: { fontSize: Typography.h3, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: Typography.body, color: Colors.textMuted },
});

export default ChatsScreen;
