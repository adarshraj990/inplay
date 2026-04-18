import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Premium Global Error Boundary for Indplay.
 * Prevents "White Screen of Death" by showing a clean, branded fallback.
 */
class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL UI CRASH:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}><View style={styles.content}><View style={styles.iconContainer}><LinearGradient colors={[Colors.danger, '#991B1B']} style={styles.circle}><Ionicons name="alert-circle" size={50} color="white" /></LinearGradient></View><Text style={styles.title}>Something went wrong</Text><Text style={styles.subtitle}>An unexpected error occurred in the game interface. We've been notified.</Text><View style={styles.errorBox}><Text style={styles.errorText} numberOfLines={3}>{String(this.state.error?.message || this.state.error || 'Unknown Rendering Error')}</Text></View><TouchableOpacity style={styles.button} onPress={this.handleReset} activeOpacity={0.8}><LinearGradient colors={Colors.gradientTurquoise} style={styles.gradient}><Text style={styles.buttonText}>Reload Interface</Text></LinearGradient></TouchableOpacity></View></SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorBox: {
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xxl,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'System',
    color: Colors.textMuted,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default GlobalErrorBoundary;
