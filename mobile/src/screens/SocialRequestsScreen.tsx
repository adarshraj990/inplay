import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { CONFIG } from '../config';
import apiService from '../services/apiService';

/**
 * SocialRequestsScreen - Manage friend invitations.
 * Syncs with backend SocialService endpoints.
 */
const SocialRequestsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(CONFIG.ENDPOINTS.SOCIAL.REQUESTS);
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (requestId: string, accept: boolean) => {
    try {
      const response = await apiService.patch(CONFIG.ENDPOINTS.SOCIAL.RESPOND, {
        requestId,
        status: accept ? 'ACCEPTED' : 'REJECTED'
      });
      
      if (response.data.success) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        Alert.alert('Success', accept ? 'Friend request accepted!' : 'Friend request declined.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to respond to request');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Friend Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.turquoise} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={64} color={Colors.surfaceBorder} />
          <Text style={styles.emptyText}>No pending requests</Text>
          <Text style={styles.emptySub}>When someone adds you, it will appear here!</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.reqCard}>
              <View style={styles.userInfo}>
                <LinearGradient colors={Colors.gradientTurquoise} style={styles.avatar}>
                  <Text style={styles.avatarText}>{(item.sender?.displayName || item.sender?.username || 'U')[0]}</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.name}>{item.sender?.displayName || item.sender?.username || 'Anonymous'}</Text>
                  <Text style={styles.username}>@{item.sender?.username}</Text>
                </View>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  onPress={() => handleResponse(item.id, false)}
                  style={[styles.btn, styles.declineBtn]}
                >
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleResponse(item.id, true)}
                  style={[styles.btn, styles.acceptBtn]}
                >
                  <LinearGradient colors={Colors.gradientTurquoise} style={styles.acceptGrad}>
                    <Ionicons name="checkmark" size={20} color={Colors.surface} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: Typography.h2, fontWeight: '800', color: Colors.textPrimary },
  list: { padding: Spacing.md, gap: Spacing.md },
  reqCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.surfaceBorder },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: Colors.surface },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  username: { fontSize: 12, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btn: { width: 40, height: 40, borderRadius: Radius.sm, overflow: 'hidden' },
  declineBtn: { backgroundColor: Colors.surfaceCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder },
  acceptGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  acceptBtn: {},
  emptyText: { fontSize: Typography.h3, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.md },
  emptySub: { fontSize: Typography.body, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
});

export default SocialRequestsScreen;
