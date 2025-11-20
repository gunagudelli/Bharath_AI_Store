// app/(auth)/register.tsx - Enhanced Register Screen with same UI as Login
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import BASE_URL from '../../config';

const { width, height } = Dimensions.get('window');

const RegisterScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('91');
  const [authMethod, setAuthMethod] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const phoneInput = useRef<PhoneInput>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSendOtp = async () => {
    if (!phoneInput.current?.isValidNumber(phoneNumber)) {
      setError('Please enter a valid phone number.');
      return;
    }

    const countryCode = phoneInput.current?.getCallingCode() || '91';
    const formattedNumber = phoneInput.current?.getNumberAfterPossiblyEliminatingZero();

    setLoading(true);
    setError('');
    
    try {
      let data;
      if (authMethod === "whatsapp") {
        data = {
          countryCode: `+${countryCode}`,
          whatsappNumber: formattedNumber?.number || phoneNumber.replace(/\D/g, ''),
          userType: "Register",
          registrationType: "whatsapp",
        };
      } else {
        data = {
          countryCode: "+91",
          mobileNumber: formattedNumber?.number || phoneNumber.replace(/\D/g, ''),
          userType: "Register",
          registrationType: "sms",
        };
      }

      const response = await axios.post(
        `${BASE_URL}user-service/registerwithMobileAndWhatsappNumber`, 
        data
      );
      
      console.log('OTP sent successfully:', response);
      
      router.push({
        pathname: '/(auth)/otp',
        params: { 
          phone: formattedNumber?.number || phoneNumber.replace(/\D/g, ''),
          method: authMethod, 
          isRegister: 'true', 
          countryCode: countryCode,
          salt: response.data.salt,
          mobileOtpSession: response.data.mobileOtpSession,
          expiryTime: response.data.otpGeneratedTime
        },
      });
   } catch (err: any) {
  console.log("Error response:", err.response?.data);

  // Extract correct message from backend
  const errorMessage =
    err.response?.data?.error ||
    err.response?.data?.message ||
    err.message ||
    "Failed to send OTP";

  // Convert message to lowercase for easy checking
  const msg = errorMessage.toLowerCase();

  if (err.response?.status === 409 || msg.includes("already")) {
    // 🚨 User already registered
    Alert.alert(
      "Already Registered",
      "You already have an account. Please log in to continue.",
      [
        {
          text: "Go to Login",
          onPress: () => router.push("/(auth)/login"),
        },
      ]
    );
  } else {
    // ❌ Any other unknown error
    Alert.alert("Error", errorMessage || "Failed to send OTP");
  }

  setLoading(false);
}

  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Background with gradient effect - Same as Login */}
      <View style={styles.background}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Hero Section - Same as Login but with register text */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Text style={styles.icon}>🚀</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Join Us</Text>
            <Text style={styles.heroSubtitle}>Create your account to get started</Text>
          </View>

          {/* Main Card - Same style as Login */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome to Bharat AI Store! 🎉</Text>
            <Text style={styles.instructionText}>
              Enter your phone number to create your account
            </Text>

            {/* Phone Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Phone Number</Text>
              
              <View style={styles.phoneInputWrapper}>
                <PhoneInput
                  ref={phoneInput}
                  defaultValue={phoneNumber}
                  defaultCode="IN"
                  layout="first"
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    setError('');
                  }}
                  onChangeFormattedText={(text) => {
                    setPhoneNumber(text);
                  }}
                  withDarkTheme
                  withShadow
                  autoFocus={false}
                  containerStyle={styles.phoneInputContainer}
                  textContainerStyle={styles.phoneInputTextContainer}
                  codeTextStyle={styles.codeTextStyle}
                  textInputStyle={styles.textInputStyle}
                  flagButtonStyle={styles.flagButtonStyle}
                  countryPickerButtonStyle={styles.countryPickerButtonStyle}
                />
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>

            {/* Auth Method Toggle */}
            <View style={styles.methodSection}>
              <Text style={styles.label}>Verification Method</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton, 
                    authMethod === 'whatsapp' && styles.activeToggleButton
                  ]}
                  onPress={() => setAuthMethod('whatsapp')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.toggleIcon,
                    authMethod === 'whatsapp' && styles.activeToggleIcon
                  ]}>
                    <Text style={[
                      styles.toggleEmoji,
                      authMethod === 'whatsapp' && styles.activeToggleEmoji
                    ]}><Ionicons name="logo-whatsapp" size={24} color="green" /></Text>
                  </View>
                  <Text style={[
                    styles.toggleText,
                    authMethod === 'whatsapp' && styles.activeToggleText
                  ]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton, 
                    authMethod === 'sms' && styles.activeToggleButton
                  ]}
                  onPress={() => setAuthMethod('sms')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.toggleIcon,
                    authMethod === 'sms' && styles.activeToggleIcon
                  ]}>
                    <Text style={[
                      styles.toggleEmoji,
                      authMethod === 'sms' && styles.activeToggleEmoji
                    ]}>💬</Text>
                  </View>
                  <Text style={[
                    styles.toggleText,
                    authMethod === 'sms' && styles.activeToggleText
                  ]}>
                    SMS
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                loading && styles.sendButtonDisabled,
                (!phoneInput.current?.isValidNumber(phoneNumber) || !phoneNumber) && styles.sendButtonDisabled
              ]} 
              onPress={handleSendOtp} 
              disabled={loading || !phoneInput.current?.isValidNumber(phoneNumber) || !phoneNumber}
              activeOpacity={0.8}
            >
              <View style={styles.buttonBackground}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Send OTP</Text>
                    <Text style={styles.buttonArrow}>→</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
  },
  circle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -width * 0.4,
    right: -width * 0.3,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  circle3: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: '30%',
    right: -width * 0.1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    // justifyContent: 'center',
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  icon: {
    fontSize: 32,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 28,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  phoneInputWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  phoneInputContainer: {
    width: '100%',
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  phoneInputTextContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 0,
    height: 52,
    borderRadius: 12,
  },
  codeTextStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  textInputStyle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    height: 52,
  },
  flagButtonStyle: {
    width: 70,
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryPickerButtonStyle: {
    backgroundColor: '#F3F4F6',
  },
  methodSection: {
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  activeToggleButton: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667eea',
  },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToggleIcon: {
    backgroundColor: '#E0E7FF',
  },
  toggleEmoji: {
    fontSize: 16,
  },
  activeToggleEmoji: {
    // Emoji color remains the same
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeToggleText: {
    color: '#667eea',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  buttonBackground: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default RegisterScreen;