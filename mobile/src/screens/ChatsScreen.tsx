import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { CONFIG } from '../config';
import apiService from '../services/apiService';

const ChatsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CHATS' | 'REQUESTS'>('CHATS');
  const [chats, setChats] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [friendsRes, pendingRes] = await Promise.all([
        apiService.get(CONFIG.ENDPOINTS.FRIENDS),
        apiService.get(CONFIG.ENDPOINTS.FRIENDS_PENDING)
      ]);

      if (friendsRes.data.success) {
        const formatted = friendsRes.data.data.map((f: any) => ({
          id: f.id,
          name: f.displayName || f.username,
          last: 'Start a conversation...',
          time: 'Now',
          unread: 0,
          online: f.status !== 'OFFLINE',
          avatar: f.avatarUrl
        }));
        setChats(formatted);
      }

      if (pendingRes.data.success) {
        setPendingRequests(pendingRes.data.data);
      }
    } catch (error) {
      console.error('Social fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespond = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const response = await apiService.patch(CONFIG.ENDPOINTS.FRIENDS_RESPOND, { requestId, status });
      if (response.data.success) {
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Response error:', error);
    }
  };

  const renderChatItem = ({ item }: { item: any }) => (
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
  );

  const renderRequestItem = ({ item }: { item: any }) => (
    <View style={styles.requestRow}>
      <View style={styles.reqInfo}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarPlaceholderText}>{item.requester.username[0]}</Text>
        </View>
        <View>
          <Text style={styles.reqName}>{item.requester.displayName || item.requester.username}</Text>
          <Text style={styles.reqSub}>wants to be your friend</Text>
        </View>
      </View>
      <View style={styles.reqActions}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRespond(item.id, 'REJECTED')}>
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleRespond(item.id, 'ACCEPTED')}>
          <LinearGradient colors={Colors.gradientTurquoise} style={styles.acceptGrad}>
            <Ionicons name="checkmark" size={20} color={Colors.surface} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
        <TouchableOpacity style={styles.composeBtn}>
          <LinearGradient colors={Colors.gradientTurquoise} style={styles.composeGrad}>
            <Ionicons name="create" size={18} color={Colors.surface} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'CHATS' && styles.activeTab]} 
          onPress={() => setActiveTab('CHATS')}
        >
          <Text style={[styles.tabText, activeTab === 'CHATS' && styles.activeTabText]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'REQUESTS' && styles.activeTab]} 
          onPress={() => setActiveTab('REQUESTS')}
        >
          <Text style={[styles.tabText, activeTab === 'REQUESTS' && styles.activeTabText]}>Requests</Text>
          {pendingRequests.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.turquoise} />
        </View>
      ) : activeTab === 'CHATS' ? (
        chats.length === 0 ? (
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
            renderItem={renderChatItem}
          />
        )
      ) : (
        pendingRequests.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={64} color={Colors.surfaceBorder} />
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySub}>When someone adds you, it shows here.</Text>
          </View>
        ) : (
          <FlatList
            data={pendingRequests}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={renderRequestItem}
          />
        )
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: Typography.h1, fontWeight: '800', color: Colors.textPrimary },
  composeBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  composeGrad: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.md, marginBottom: Spacing.md },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder },
  activeTab: { backgroundColor: Colors.turquoise },
  tabText: { fontSize: Typography.caption, fontWeight: '600', color: Colors.textSecondary },
  activeTabText: { color: Colors.surface },
  tabBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: Colors.saffron, borderRadius: Radius.full, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.background },

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

  requestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder + '22' },
  reqInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { fontSize: 18, fontWeight: '700', color: Colors.turquoise },
  reqName: { fontSize: Typography.body, fontWeight: '700', color: Colors.textPrimary },
  reqSub: { fontSize: Typography.tiny, color: Colors.textMuted },
  reqActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rejectBtn: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  acceptBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  acceptGrad: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});

export default ChatsScreen;
