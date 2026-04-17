import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, FlatList,
  TouchableOpacity, ActivityIndicator, Pressable
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import apiService from '../../services/apiService';

interface OnlineUsersModalProps {
  visible: boolean;
  onClose: () => void;
}

const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const fetchOnlineUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/users/online');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (e) {
      console.error('Fetch online users error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchOnlineUsers();
  }, [visible]);

  const handleAddFriend = async (targetId: string) => {
    try {
      setRequestingIds(prev => new Set(prev).add(targetId));
      const response = await apiService.post('/friends/request', { receiverId: targetId });
      
      if (response.data.success) {
        setRequestedIds(prev => new Set(prev).add(targetId));
      }
    } catch (e) {
      console.error('Add friend error:', e);
    } finally {
      setRequestingIds(prev => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  const renderUser = ({ item }: { item: any }) => {
    const isRequesting = requestingIds.has(item.id);
    const isRequested = requestedIds.has(item.id);

    return (
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.username}>{item.displayName || item.username}</Text>
            <Text style={styles.userStatus}>Level {item.level || 1}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, isRequested && styles.requestedBtn]}
          onPress={() => !isRequested && handleAddFriend(item.id)}
          disabled={isRequesting || isRequested}
        >
          {isRequesting ? (
            <ActivityIndicator size="small" color={Colors.surface} />
          ) : (
            <>
              <Ionicons
                name={isRequested ? 'checkmark' : 'person-add'}
                size={16}
                color={Colors.surface}
              />
              <Text style={styles.addBtnText}>
                {isRequested ? 'Requested' : 'Add'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Players Online</Text>
              <Text style={styles.subtitle}>{users.length} active now</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.turquoise} style={{ marginVertical: 40 }} />
          ) : users.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={Colors.surfaceBorder} />
              <Text style={styles.emptyText}>No other players online</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              keyExtractor={u => u.id}
              renderItem={renderUser}
              contentContainerStyle={styles.list}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    minHeight: '60%',
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder + '44',
  },
  title: { fontSize: Typography.h2, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: Typography.caption, color: Colors.turquoise, fontWeight: '600' },
  closeBtn: { padding: 4 },
  list: { padding: Spacing.md },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder },
  avatarText: { color: Colors.textSecondary, fontWeight: '700', fontSize: 18 },
  username: { fontSize: Typography.body, fontWeight: '700', color: Colors.textPrimary },
  userStatus: { fontSize: Typography.tiny, color: Colors.textMuted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.turquoise,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    minWidth: 80,
    justifyContent: 'center',
  },
  requestedBtn: { backgroundColor: Colors.textMuted, opacity: 0.8 },
  addBtnText: { color: Colors.surface, fontSize: 12, fontWeight: '700' },
  sep: { height: 1, backgroundColor: Colors.surfaceBorder + '22', marginVertical: Spacing.xs },
  empty: { alignItems: 'center', marginVertical: 60, gap: 10 },
  emptyText: { color: Colors.textMuted, fontSize: Typography.body, fontWeight: '600' },
});

export default OnlineUsersModal;
