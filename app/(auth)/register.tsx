// app/(auth)/register.tsx - Enhanced Register Screen with SMS/WhatsApp OTP
// Modern UI with gradient background, improved card design, and smooth animations
// Full name field removed per user request
// ✅ Update: Dynamic payload based on authMethod (whatsappNumber for WhatsApp, mobileNumber for SMS).
// Extracts countryCode from PhoneInput ref; uses +countryCode for WhatsApp, +91 for SMS.

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState, useRef } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PhoneInput from 'react-native-phone-number-input';
import axios from 'axios';
import BASE_URL from '../../config';

const { width, height } = Dimensions.get('window');

const RegisterScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('91'); // ✅ Added: Dynamic country code from PhoneInput
  const [authMethod, setAuthMethod] = useState<'sms' | 'whatsapp'>('whatsapp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const phoneInput = React.useRef<PhoneInput>(null);

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // ✅ Dynamic payload based on authMethod
      let data;
      if (authMethod === "whatsapp") {
        data = {
          countryCode: "+" + countryCode,
          whatsappNumber: phoneNumber, // National number for WhatsApp
          userType: "Register",
          registrationType: "whatsapp",

        };
      } else {
        data = {
          countryCode: "+91",
          mobileNumber: phoneNumber,
          userType: "Register",
          registrationType: "sms",
        };
      }
      const response = await axios.post(`${BASE_URL}user-service/registerwithMobileAndWhatsappNumber`, data);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: phoneNumber, method: authMethod, isRegister: 'true',countryCode: countryCode,salt : response.data.salt,mobileOtpSession : response.data.mobileOtpSession,expiryTime : response.data.otpGeneratedTime },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={48} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSubtitle}>Join us today and get started</Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome to Bharat AI Store! 👋</Text>
            <Text style={styles.instructionText}>
              Enter your phone number to create your account
            </Text>

            {/* Phone Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputWrapper}>
                <PhoneInput
                  ref={phoneInput}
                  defaultValue={phoneNumber}
                  defaultCode="IN"
                  layout="first"
                  onChangeText={(value) => {
                    setPhoneNumber(value);
                    // ✅ Extract country code for WhatsApp payload
                    const callingCode = phoneInput.current?.getCallingCode() || '91';
                    setCountryCode(callingCode);
                    setError('');
                  }}
                  containerStyle={styles.phoneInputContainer}
                  textContainerStyle={styles.phoneTextContainer}
                  textInputStyle={styles.phoneTextInput}
                  codeTextStyle={styles.codeText}
                  flagButtonStyle={styles.flagButton}
                />
              </View>
            </View>

            {/* Auth Method Toggle */}
            <View style={styles.methodSection}>
              <Text style={styles.label}>Verification Method</Text>
              <View style={styles.toggleContainer}>

                <TouchableOpacity
                  style={[styles.toggleButton, authMethod === 'whatsapp' && styles.activeToggle]}
                  onPress={() => setAuthMethod('whatsapp')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, authMethod === 'whatsapp' && styles.activeIconCircle]}>
                    <Ionicons 
                      name="logo-whatsapp" 
                      size={20} 
                      color={authMethod === 'whatsapp' ? '#667eea' : '#9CA3AF'} 
                    />
                  </View>
                  <Text style={[styles.toggleText, authMethod === 'whatsapp' && styles.activeToggleText]}>
                    WhatsApp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleButton, authMethod === 'sms' && styles.activeToggle]}
                  onPress={() => setAuthMethod('sms')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, authMethod === 'sms' && styles.activeIconCircle]}>
                    <Ionicons 
                      name="chatbubble-ellipses" 
                      size={20} 
                      color={authMethod === 'sms' ? '#667eea' : '#9CA3AF'} 
                    />
                  </View>
                  <Text style={[styles.toggleText, authMethod === 'sms' && styles.activeToggleText]}>
                    SMS
                  </Text>
                </TouchableOpacity>


              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Send OTP Button */}
            <TouchableOpacity 
              style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
              onPress={handleSendOtp} 
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#D1D5DB', '#D1D5DB'] : ['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <LottieView
                      source={require('../../assets/animations/loading.json')}
                      autoPlay
                      loop
                      style={styles.lottieLoader}
                    />
                    <Text style={styles.buttonText}>Sending...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Send OTP</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                )}
              </LinearGradient>
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
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent:'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    marginBottom: 8,
  },
  phoneInputWrapper: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  phoneInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  phoneTextContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  phoneTextInput: {
    fontSize: 16,
    color: '#1F2937',
    height: 50,
  },
  codeText: {
    fontSize: 16,
    color: '#1F2937',
  },
  flagButton: {
    width: 60,
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
  },
  activeToggle: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667eea',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  activeIconCircle: {
    backgroundColor: '#E0E7FF',
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
    marginBottom: 20,
    gap: 8,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
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
  lottieLoader: {
    width: 24,
    height: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
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
    marginTop: 24,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default RegisterScreen;