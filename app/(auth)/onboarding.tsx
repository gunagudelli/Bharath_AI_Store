// app/(modal)/onboarding.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native'; // 👈 For animations
import { useOnboarding } from '../hooks/useOnboarding';

const { width } = Dimensions.get('window');

// Custom Buttons
const SkipButton: React.FC<any> = ({ skipLabel, ...props }) => (
  <Text {...props} style={styles.skipText}>{skipLabel}</Text>
);
const NextButton: React.FC<any> = ({ nextLabel, ...props }) => (
  <Text {...props} style={styles.nextText}>{nextLabel}</Text>
);
const DoneButton: React.FC<any> = ({ ...props }) => (
  <TouchableOpacity {...props} activeOpacity={0.8}>
    <Text style={styles.doneText}>Get Started</Text>
  </TouchableOpacity>
);

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { markAsCompleted } = useOnboarding();

  const handleDone = () => {
    markAsCompleted();
    router.replace('/welcome');
  };
  const handleSkip = () => handleDone();

  // 🎨 Onboarding Pages with Lottie Animations
  const pages = [
    {
      backgroundColor: '#E8EAF6',
      image: (
        <LottieView
          source={require('../../assets/animations/welcome_ai_marketplace.json')}
          autoPlay
          loop
          style={{ width: width * 0.8, height: 300 }}
        />
      ),
      title: <Text style={styles.title}>Welcome to Bharat AI Store</Text>,
      subtitle: (
        <Text style={styles.subtitle}>
          Discover a smart marketplace powered by AI — connecting users and businesses for effortless shopping, productivity, and innovation.
        </Text>
      ),
    },
    {
      backgroundColor: '#E3F2FD',
      image: (
        <LottieView
          source={require('../../assets/animations/intelligent_ai_experience.json')}
          autoPlay
          loop
          style={{ width: width * 0.8, height: 300 }}
        />
      ),
      title: <Text style={styles.title}>Intelligent AI Experience</Text>,
      subtitle: (
        <Text style={styles.subtitle}>
          Explore personalized recommendations, voice search, and AI-driven tools designed to make your shopping and digital experience smarter and faster.
        </Text>
      ),
    },
    {
      backgroundColor: '#E8F5E8',
      image: (
        <LottieView
          source={require('../../assets/animations/users_business_collaboration.json')}
          autoPlay
          loop
          style={{ width: width * 0.8, height: 300 }}
        />
      ),
      title: <Text style={styles.title}>Built for Users and Businesses</Text>,
      subtitle: (
        <Text style={styles.subtitle}>
          Whether you’re a customer exploring products or a business listing services — Bharat AI Store makes it simple, secure, and accessible for all.
        </Text>
      ),
    },
    {
      backgroundColor: '#FFF5E6',
      image: (
        <LottieView
          source={require('../../assets/animations/get_started.json')}
          autoPlay
          loop
          style={{ width: width * 0.8, height: 300 }}
        />
      ),
      title: <Text style={styles.title}>Get Started Instantly</Text>,
      subtitle: (
        <Text style={styles.subtitle}>
          Sign in quickly, explore demo accounts, and experience Bharat AI Store — your gateway to AI-powered business and digital innovation.
        </Text>
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Onboarding
        pages={pages}
        showSkip
        showNext
        showDone
        SkipButtonComponent={SkipButton}
        NextButtonComponent={NextButton}
        DoneButtonComponent={DoneButton}
        onSkip={handleSkip}
        onDone={handleDone}
        controlStatusBar
        bottomBarHeight={80}
        bottomBarColor="transparent"
        bottomBarHighlight={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
    lineHeight: 26,
    paddingHorizontal: 40,
  },
  skipText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginLeft: 50,
  },
  nextText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 50,
  },
  doneText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '600',
    marginRight: 50,
  },
});

export default OnboardingScreen;
