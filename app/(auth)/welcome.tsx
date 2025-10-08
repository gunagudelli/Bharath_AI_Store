// app/(auth)/welcome.tsx - Welcome Screen
// "Get Started with your Fitness Journey" header from mockup.
// Buttons for Login/Register; navigates to respective screens.
// Light blue bg, centered layout, rounded buttons (blue primary, white secondary).
// Optional: Add animation (e.g., Lottie) for journey icon if needed.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
// import { RootStackParamList } from '../../types/TS navigation'; // Adjust path

const { height,width } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => router.push('/(auth)/login');
  const handleRegister = () => router.push('/(auth)/register');

  return (
    <View style={styles.container}>
      {/* Header from mockup */}
      <View style={styles.header}>
       <Image source={{uri: 'https://www.askoxy.ai/static/media/bharatAI.c1a559f1535acdc3e136.png'}} resizeMode="contain" style={styles.image} />
        <Text style={styles.title}>Get Started with your</Text>
        <Text style={styles.subtitle}>Agent Creation</Text>
      </View>

      {/* Buttons from mockup */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
          <Text style={styles.secondaryButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue from mockup
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: width*0.65,
    height: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2', // Blue from mockup
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3d2a71', // Your purple accent
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#2196F3', // Blue from mockup
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default WelcomeScreen;