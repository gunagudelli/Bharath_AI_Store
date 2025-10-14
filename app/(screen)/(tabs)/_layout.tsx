// app/(screen)/(tabs)/_layout.tsx - Enhanced Tabs Layout with Modern Design
// Beautiful tab bar with smooth animations, gradients, and perfect alignment
// Features: Active state animations, gradient underlines, badges, haptic feedback

import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme, Platform, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { logout } from '../../Redux/action/index'; // Adjust path
import { Alert } from 'react-native';
import { AppDispatch } from '@/app/Redux/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Theme colors
  const activeTintColor = isDark ? '#A78BFA' : '#667eea';
  const inactiveTintColor = isDark ? '#6B7280' : '#9CA3AF';
  const tabBarBg = isDark ? '#1F2937' : '#FFFFFF';
  const borderColor = isDark ? '#374151' : '#F3F4F6';

  const handleTabPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  

  const handleLogout = (): void => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.removeItem('userData'); // ✅ Clear persisted token
             console.log('Logout: Storage cleared');
            await dispatch(logout()); // ✅ Clears state/storage
            router.replace('/(auth)/login'); // Redirect to auth
          },
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        // headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '800',
          color: isDark ? '#E5E7EB' : '#111827',
        },
        headerStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderBottomWidth: 0,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerShown: true,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 2,
          paddingHorizontal: 8,
          position: 'absolute',
          borderRadius: 24,
          marginHorizontal: 16,
          marginBottom: 16,
          borderColor: borderColor,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
        headerLeft: () => {
          return (<View style={{ width: 40,marginLeft:16,marginRight:16,backgroundColor : "#ffff",justifyContent:'center',alignItems:'center',borderRadius:100,height:40 }}>
               <Image 
              source={require('../../../assets/images/bharat-Eicon.png')}
              style={{ width: 32, height: 32, borderRadius: 8, }}
              resizeMode="contain"
              />
            </View>
            ); 
        },
        headerRight: () => {
          return <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
              <MaterialIcons 
                name='logout'
                size={28}
                color={isDark ? '#E5E7EB' : '#111827'}
                style={{ marginRight: 20 }}
              />
          </TouchableOpacity>
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bharat AI Store',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="home-filled"
              color={color}
              focused={focused}
              isDark={isDark}
            />
          ),
          // tabBarBadge: 3,
          // tabBarBadgeStyle: styles.badge,
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'My Agents',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="explore"
              color={color}
              focused={focused}
              isDark={isDark}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon="person"
              color={color}
              focused={focused}
              isDark={isDark}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}

interface TabIconProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  focused: boolean;
  isDark: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, focused, isDark }) => {
  return (
    <View style={styles.iconContainer}>
      {/* Background glow for active tab */}
      {focused && (
        <View style={[styles.activeBackground, isDark && styles.activeBackgroundDark]} />
      )}
      
      {/* Icon */}
      <MaterialIcons
        name={icon}
        size={focused ? 28 : 24}
        color={color}
        style={{
          transform: [{ scale: focused ? 1.1 : 1 }],
        }}
      />
      
      {/* Active indicator line */}
      {focused && (
        <LinearGradient
          colors={isDark ? ['#A78BFA', '#8B5CF6'] : ['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeIndicator}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    opacity: 0.5,
  },
  activeBackgroundDark: {
    backgroundColor: '#312E81',
    opacity: 0.3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -16,
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    backgroundColor: '#EF4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
  },
});