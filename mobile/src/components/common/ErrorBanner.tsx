import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  visible?: boolean;
}

/**
 * Universal Error UI component designed to safely render error strings
 * and prevent crashes while maintaining the Indplay aesthetic.
 */
const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss, visible = true }) => {
  if (!visible || !message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={20} color={Colors.danger} style={styles.icon} />
        <Text style={styles.message} numberOfLines={3}>
          {message}
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
            <Ionicons name="close" size={18} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(248, 113, 113, 0.1)', // Light red background (using Colors.danger as base)
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  message: {
    flex: 1,
    color: '#FFB8B8', // Lighter red for text on dark background
    fontSize: Typography.caption,
    fontWeight: '600',
    lineHeight: 18,
  },
  dismissBtn: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});

export default ErrorBanner;
