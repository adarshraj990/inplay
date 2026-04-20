import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen    from '../screens/HomeScreen';
import GamesScreen   from '../screens/GamesScreen';
import ChatsScreen   from '../screens/ChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TaskCenterScreen from '../screens/TaskCenterScreen';
import { Colors, Typography, Radius } from '../constants/theme';

const Tab = createBottomTabNavigator();

type TabRoute = 'Home' | 'Games' | 'Tasks' | 'Chats' | 'Profile';

const TAB_ICONS: Record<TabRoute, { active: string; inactive: string }> = {
  Home:    { active: 'home',              inactive: 'home-outline'         },
  Games:   { active: 'game-controller',   inactive: 'game-controller-outline' },
  Tasks:   { active: 'list',             inactive: 'list-outline'         },
  Chats:   { active: 'chatbubbles',       inactive: 'chatbubbles-outline'  },
  Profile: { active: 'person-circle',     inactive: 'person-circle-outline'},
};

import { useNotificationStats } from '../hooks/useNotificationStats';

interface TabIconProps {
  route: TabRoute;
  focused: boolean;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({ route, focused, color }) => {
  const icons = TAB_ICONS[route];
  const unreadCount = useNotificationStats();
  const badge = route === 'Chats' ? unreadCount : 0;

  return (
    <View style={tabIconStyles.wrap}>
      {focused && <View style={tabIconStyles.indicator} />}
      <View style={tabIconStyles.icon}>
        <Ionicons
          name={focused ? icons.active : icons.inactive}
          size={focused ? 26 : 22}
          color={color}
        />
        {!!badge && badge > 0 && (
          <View style={tabIconStyles.badge}>
            <Text style={tabIconStyles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingTop: 6 },
  indicator: {
    position: 'absolute',
    top: -1,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.turquoise,
  },
  icon: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: Colors.saffron,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
});

const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor:   Colors.turquoise,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarLabelStyle: {
        fontSize: Typography.tiny,
        fontWeight: '600',
        marginBottom: Platform.OS === 'ios' ? 0 : 8,
        marginTop: -2,
      },
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
        height: Platform.OS === 'ios' ? 85 : 64,
        paddingTop: 4,
        // Subtle glow
        shadowColor: Colors.turquoise,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 20,
      },
      tabBarIcon: ({ focused, color }) => (
        <TabIcon route={route.name as TabRoute} focused={focused} color={color} />
      ),
    })}
  >
    <Tab.Screen name="Home"    component={HomeScreen}    />
    <Tab.Screen name="Games"   component={GamesScreen}   />
    <Tab.Screen name="Tasks"   component={TaskCenterScreen} />
    <Tab.Screen name="Chats"   component={ChatsScreen}   />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default BottomTabNavigator;
