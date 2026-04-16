import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import WhoIsSpyRoomScreen from './screens/WhoIsSpyRoomScreen';
import { EmoteProvider } from './context/EmoteContext';
import { Colors } from './constants/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary:       Colors.turquoise,
            background:    Colors.background,
            card:          Colors.surface,
            text:          Colors.textPrimary,
            border:        Colors.surfaceBorder,
            notification:  Colors.saffron,
          },
          fonts: {
            regular: { fontFamily: 'System', fontWeight: '400' },
            medium:  { fontFamily: 'System', fontWeight: '500' },
            bold:    { fontFamily: 'System', fontWeight: '700' },
            heavy:   { fontFamily: 'System', fontWeight: '900' },
          },
        }}
      >
        <StatusBar style="light" backgroundColor={Colors.background} />
        <EmoteProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="WhoIsSpyRoom" component={WhoIsSpyRoomScreen} />
          </Stack.Navigator>
        </EmoteProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
