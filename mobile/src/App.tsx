import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StatusBar } from 'react-native';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import WhoIsSpyRoomScreen from './screens/WhoIsSpyRoomScreen';
import SpyLobby from './screens/game/SpyLobby';
import RoleAssignment from './screens/game/RoleAssignment';
import GlobalErrorBoundary from './components/common/ErrorBoundary';
import SocialRequestsScreen from './screens/SocialRequestsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import { EmoteProvider } from './context/EmoteContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Colors } from './constants/theme';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.turquoise} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="SpyLobby" component={SpyLobby} />
          <Stack.Screen name="RoleAssignment" component={RoleAssignment} />
          <Stack.Screen name="WhoIsSpyRoom" component={WhoIsSpyRoomScreen} />
          <Stack.Screen 
            name="SocialRequests" 
            component={SocialRequestsScreen} 
            options={{ animation: 'fade_from_bottom' }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ animation: 'fade_from_bottom' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
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
            } as any}
          >
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <EmoteProvider>
              <RootNavigator />
            </EmoteProvider>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}
