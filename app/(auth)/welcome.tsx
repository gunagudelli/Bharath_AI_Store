// app/(auth)/welcome.tsx - Welcome Screen
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => router.push('/(auth)/login');
  const handleRegister = () => router.push('/(auth)/register');

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image 
              source={{uri: 'https://www.askoxy.ai/static/media/bharatAI.c1a559f1535acdc3e136.png'}} 
              resizeMode="contain" 
              style={styles.image} 
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Get Started with your</Text>
            <Text style={styles.subtitle}>Agent Creation</Text>
          </View>
          
          <Text style={styles.description}>
            Create intelligent agents that work for you. 
            Start your journey today.
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
            <View style={styles.buttonShadow} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleRegister}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 40,
    zIndex: 2,
  },
  // Background Circles
  backgroundCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(187, 222, 251, 0.6)',
    top: -width * 0.3,
    right: -width * 0.2,
    zIndex: 1,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(144, 202, 249, 0.4)',
    bottom: -width * 0.2,
    left: -width * 0.1,
    zIndex: 1,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(179, 229, 252, 0.5)',
    top: '40%',
    right: -width * 0.1,
    zIndex: 1,
  },
  // Header Styles
  header: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  imageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  image: {
    width: width * 0.55,
    height: 90,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: '#1976D2',
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#3d2a71',
    textAlign: 'center',
    marginTop: 6,
    textShadowColor: 'rgba(61, 42, 113, 0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  description: {
    fontSize: 16,
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
    maxWidth: '85%',
    fontWeight: '400',
  },
  // Button Styles
  buttonSection: {
    width: '100%',
    gap: 20,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  buttonShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  // Footer Styles
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '400',
  },
});

export default WelcomeScreen;