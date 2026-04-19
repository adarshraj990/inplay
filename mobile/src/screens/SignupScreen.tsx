import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import ErrorBanner from '../components/common/ErrorBanner';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();

  const handleSignup = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError(null);
    try {
      await register(username, email, password);
    } catch (e: any) {
      setError(e.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}><ScrollView contentContainerStyle={styles.scrollContent}><TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity><View style={styles.header}><Text style={styles.title}>Create Account</Text><Text style={styles.subtitle}>Join the Indplay community today!</Text></View><View style={styles.form}><ErrorBanner message={error || ''} visible={!!error} onDismiss={() => setError(null)} /><View style={styles.inputContainer}><Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Username" placeholderTextColor={Colors.textMuted} value={username} onChangeText={setUsername} autoCapitalize="none" /></View><View style={styles.inputContainer}><Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View><View style={styles.inputContainer}><Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} /><TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textMuted} /></TouchableOpacity></View><View style={styles.inputContainer}><Ionicons name="shield-checkmark-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} /><TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={Colors.textMuted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} /></View><TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={isLoading}><LinearGradient colors={[Colors.turquoise, '#00A8A8']} style={styles.signupGradient}>{isLoading ? (<ActivityIndicator color="white" />) : (<Text style={styles.signupBtnText}>Sign Up</Text>)}</LinearGradient></TouchableOpacity></View><View style={styles.footer}><Text style={styles.footerText}>Already have an account? <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>Login</Text></Text></View></ScrollView></KeyboardAvoidingView></SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.xl, flexGrow: 1, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: Spacing.md, left: Spacing.md, padding: Spacing.xs, zIndex: 1 },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 0.5 },
  subtitle: { fontSize: Typography.body, color: Colors.textSecondary, marginTop: 4 },
  
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
  
  signupBtn: { height: 56, borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.md },
  signupGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  signupBtnText: { color: 'white', fontSize: Typography.h3, fontWeight: '700' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  footerText: { color: Colors.textSecondary, fontSize: Typography.body },
  loginText: { color: Colors.turquoise, fontSize: Typography.body, fontWeight: '700' },
});

export default SignupScreen;
