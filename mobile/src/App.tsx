import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import WhoIsSpyRoomScreen from './screens/WhoIsSpyRoomScreen';
import { EmoteProvider } from './context/EmoteContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Colors } from './constants/theme';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.turquoise} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="WhoIsSpyRoom" component={WhoIsSpyRoomScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
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
            <RootNavigator />
          </EmoteProvider>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
