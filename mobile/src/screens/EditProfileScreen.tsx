import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { CONFIG } from '../config';
import apiService from '../services/apiService';

/**
 * EditProfileScreen - Update user settings.
 * Allows updating display name and bio. 
 * Avatar selection uses pre-defined premium URL patterns for now.
 */
const EditProfileScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const { initialUser } = route.params || {};
  const [displayName, setDisplayName] = useState(initialUser?.displayName || '');
  const [bio, setBio] = useState(initialUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(initialUser?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (displayName.length < 2) {
      Alert.alert('Invalid Name', 'Display name must be at least 2 characters long.');
      return;
    }

    try {
      setSaving(true);
      const response = await apiService.patch(CONFIG.ENDPOINTS.PROFILE_UPDATE, {
        displayName,
        bio,
        avatarUrl
      });

      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'Awesome', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.turquoise} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={Colors.gradientTurquoise} style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(displayName || 'U')[0]}</Text>
            </View>
          </LinearGradient>
          <TouchableOpacity style={styles.changeAvatarBtn}>
            <Text style={styles.changeAvatarText}>Change Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="How others see you"
                placeholderTextColor={Colors.textMuted}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>BIO</Text>
            <View style={[styles.inputWrap, styles.textAreaWrap]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell the world about yourself..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                maxLength={300}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </View>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>
              Your display name is visible to everyone in game rooms and chat.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: Typography.h3, fontWeight: '800', color: Colors.textPrimary },
  saveText: { fontSize: 16, fontWeight: '700', color: Colors.turquoise },
  
  scroll: { paddingBottom: Spacing.xxl },
  avatarSection: { alignItems: 'center', marginVertical: Spacing.xl },
  avatarRing: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.background },
  avatarText: { fontSize: 40, fontWeight: '900', color: Colors.turquoise },
  changeAvatarBtn: { marginTop: Spacing.sm },
  changeAvatarText: { fontSize: 14, fontWeight: '600', color: Colors.turquoise },

  form: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, marginLeft: 4 },
  inputWrap: { backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 50, justifyContent: 'center', borderWidth: 1, borderColor: Colors.surfaceBorder },
  textAreaWrap: { height: 120, paddingVertical: Spacing.sm },
  input: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
  textArea: { flex: 1 },
  charCount: { alignSelf: 'flex-end', fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  
  infoBox: { flexDirection: 'row', gap: 8, backgroundColor: Colors.surfaceCard, padding: Spacing.md, borderRadius: Radius.sm, marginTop: Spacing.md },
  infoText: { flex: 1, fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
});

export default EditProfileScreen;
