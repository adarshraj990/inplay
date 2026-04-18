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
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import ErrorBanner from '../components/common/ErrorBanner';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError(null);
    try {
      await login(email, password);
    } catch (e: any) {
      Alert.alert("Network Error", e.message);
      setError(e.message || 'Login failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.turquoise, Colors.deepBlue]}
                style={styles.logoGradient}
              >
                <Ionicons name="game-controller" size={40} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Indplay</Text>
            <Text style={styles.subtitle}>Welcome back, gamer!</Text>
          </View>

          <View style={styles.form}>
            <ErrorBanner 
              message={error || ''} 
              visible={!!error} 
              onDismiss={() => setError(null)} 
            />
            
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

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={Colors.textMuted} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginBtn} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.turquoise, '#00A8A8']}
                style={styles.loginGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginBtnText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.googleBtn}>
              <Ionicons name="logo-google" size={20} color="white" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text 
                style={styles.signupText} 
                onPress={() => navigation.navigate('Signup')}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.xl, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoContainer: { marginBottom: Spacing.md },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: '900', color: Colors.textPrimary, letterSpacing: 1 },
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
  
  forgotBtn: { alignSelf: 'flex-end', marginTop: -Spacing.xs },
  forgotText: { color: Colors.turquoise, fontSize: Typography.caption, fontWeight: '600' },
  
  loginBtn: { height: 56, borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.md },
  loginGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginBtnText: { color: 'white', fontSize: Typography.h3, fontWeight: '700' },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg },
  divider: { flex: 1, height: 1, backgroundColor: Colors.surfaceBorder },
  dividerText: { color: Colors.textMuted, marginHorizontal: Spacing.md, fontSize: Typography.tiny, fontWeight: '700' },
  
  googleBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#333',
  },
  googleBtnText: { color: 'white', fontSize: Typography.body, fontWeight: '600' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  footerText: { color: Colors.textSecondary, fontSize: Typography.body },
  signupText: { color: Colors.turquoise, fontSize: Typography.body, fontWeight: '700' },
});

export default LoginScreen;
