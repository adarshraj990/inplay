import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useAuth, authClient } from '../context/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import ErrorBanner from '../components/common/ErrorBanner';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const AuthRecoveryScreen = ({ navigation, route }: Props) => {
  const [email, setEmail] = useState(route.params?.email || '');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isLoading, forgotPassword } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setError(null);
    setIsResetting(true);
    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (e: any) {
      console.error('Forgot password error:', e);
      setError(e.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-unread" size={60} color={Colors.turquoise} />
          </View>
          <Text style={styles.title}>Check your Email</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              We've sent a password reset link to <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{email}</Text>. Please follow the instructions in the email to reset your password.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.backToLoginBtn} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
          </View>

          <View style={styles.form}>
            <ErrorBanner message={error || ''} visible={!!error} onDismiss={() => setError(null)} />
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Email Address" 
                placeholderTextColor={Colors.textMuted} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>

            <TouchableOpacity 
              style={styles.resetBtn} 
              onPress={handleReset} 
              disabled={isResetting || isLoading}
            >
              <LinearGradient colors={[Colors.turquoise, '#00A8A8']} style={styles.resetGradient}>
                {isResetting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.resetBtnText}>Send Reset Link</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.xl, flexGrow: 1, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: Spacing.md, left: Spacing.md, padding: Spacing.xs, zIndex: 1 },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 0.5 },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 8, lineHeight: 22 },
  subtitleContainer: { marginTop: 8 },
  
  form: { gap: Spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, color: Colors.textPrimary, fontSize: Typography.body },
  
  resetBtn: { height: 56, borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.md },
  resetGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resetBtnText: { color: 'white', fontSize: Typography.h3, fontWeight: '700' },

  successContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  iconContainer: { marginBottom: Spacing.xl },
  backToLoginBtn: { marginTop: Spacing.xxl },
  backToLoginText: { color: Colors.turquoise, fontSize: Typography.body, fontWeight: '700' },
});

export default AuthRecoveryScreen;
