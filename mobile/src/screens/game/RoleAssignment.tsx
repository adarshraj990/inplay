import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';

const RoleAssignment: React.FC<{ navigation: any }> = ({ navigation }) => {
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const revealProgress = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    cardOpacity.value = withTiming(1, { duration: 600 });
    revealProgress.value = withDelay(1000, withTiming(1, { duration: 1200 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
    transform: [{ translateY: interpolate(revealProgress.value, [0, 1], [20, 0]) }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, '#0F3460']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <Text style={styles.headerTitle}>MISSION BRIEFING</Text>
        
        <Animated.View style={[styles.roleCard, cardStyle]}>
          <LinearGradient colors={['#24243E', '#1A1A2E']} style={styles.cardGradient}>
            <Ionicons name="finger-print" size={80} color={Colors.turquoise} style={styles.icon} />
            
            <Text style={styles.label}>YOUR IDENTITY IS</Text>
            
            <Animated.View style={[styles.roleInfo, revealStyle]}>
              <Text style={styles.roleName}>CITIZEN</Text>
              <Text style={styles.roleDescription}>
                Observe others carefully. Find the spy before they figure out the secret word!
              </Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <TouchableOpacity 
          style={styles.continueBtn} 
          onPress={() => navigation.navigate('WhoIsSpyRoom')}
        >
          <Text style={styles.continueText}>I'M READY</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.turquoise} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', gap: Spacing.xxl },
  headerTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '900', letterSpacing: 4 },
  
  roleCard: { 
    width: '100%', 
    height: 400, 
    borderRadius: Radius.xl, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 200, 0.3)',
    elevation: 20,
    shadowColor: Colors.turquoise,
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  cardGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  icon: { marginBottom: Spacing.xl },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  
  roleInfo: { alignItems: 'center', marginTop: Spacing.md },
  roleName: { color: Colors.turquoise, fontSize: 48, fontWeight: '900', letterSpacing: 2 },
  roleDescription: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 22 },

  continueBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 24, borderRadius: Radius.full, backgroundColor: 'rgba(0, 212, 200, 0.1)', borderWidth: 1, borderColor: Colors.turquoise },
  continueText: { color: Colors.turquoise, fontWeight: '900', letterSpacing: 1 },
});

export default RoleAssignment;
