// app/(auth)/otp.tsx - Enhanced OTP Verification Screen
// Modern UI with gradient background, improved input fields, and smooth animations
// ✅ Update: Dynamic payload for verify/resend based on authMethod (whatsappOtpValue/mobileOtpValue).
// Uses whatsappNumber for WhatsApp, mobileNumber for SMS in resend (consistent with login/register).

import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    StatusBar,
    Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useDispatch } from 'react-redux'; // ✅ Added for dispatch
import { AccessToken } from '../Redux/action';
import { RootState, AppDispatch } from '../Redux/types';
import BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OTPScreen: React.FC = () => {
  const { phone, method, isRegister, countryCode, salt, mobileOtpSession, expiryTime } = useLocalSearchParams<{ phone: string; method: string; isRegister?: string; countryCode: string; salt: string; mobileOtpSession: string; expiryTime: string }>();
  const otpLength = method === 'whatsapp' ? 4 : 6; // ✅ Dynamic: 4 for WhatsApp, 6 for SMS
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill('')); // ✅ Dynamic initial array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();
  const isRegisterMode = isRegister === 'true';
  const dispatch = useDispatch<AppDispatch>();
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (text && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (index === otpLength - 1 && text) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === otpLength) {
        Keyboard.dismiss();
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const otpString = otpValue || otp.join('');
    if (otpString.length !== otpLength) {
      setError(`Please enter the complete ${otpLength}-digit code.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // ✅ Dynamic payload based on authMethod
      let data;
      if (method === "whatsapp") {
        data = {
          countryCode: "+"+countryCode, // Use +91 for verify (or dynamic if needed)
          whatsappNumber: phone,
          whatsappOtpValue: otpString,
          userType: isRegisterMode ? 'Register' : 'Login',
          registrationType: "whatsapp",
          salt: salt,
          whatsappOtpSession: mobileOtpSession,
          expiryTime: expiryTime,

        };
      } else {
        data = {
          countryCode: "+"+countryCode, // Use +91 for verify (or dynamic if needed)
          mobileNumber: phone,
          mobileOtpValue: otpString,
          userType: isRegisterMode ? 'Register' : 'Login',
          registrationType: "sms",
          salt: salt,
          mobileOtpSession: mobileOtpSession,
          expiryTime: expiryTime,
        };
      }

      console.log('Verifying OTP with data:', data);
      
      const response = await axios.post(`${BASE_URL}user-service/registerwithMobileAndWhatsappNumber`, data);
      dispatch(AccessToken(response.data));
      // ✅ Save to AsyncStorage for auto-login
      await AsyncStorage.setItem('userData', JSON.stringify(response.data)); // Key: 'userData' (matches persist)
      router.replace('/(screen)/(tabs)'); // Navigate to main app on success
    } catch (err: any) {
        console.error(err.response);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setOtp(Array(otpLength).fill('')); // ✅ Reset dynamic array
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setResendLoading(true);
    try {
      // ✅ Dynamic payload for resend (same as send in login/register)
      let data;
      if (method === "whatsapp") {
        data = {
          countryCode: countryCode,
          whatsappNumber: phone,
          userType: isRegisterMode ? 'Register' : 'Login',
          registrationType: "whatsapp",
        };
      } else {
        data = {
          countryCode: countryCode,
          mobileNumber: phone,
          userType: isRegisterMode ? 'Register' : 'Login',
          registrationType: "sms",
        };
      }
      await axios.post(`${BASE_URL}user-service/registerwithMobileAndWhatsappNumber`, data);
      setError('');
      setTimer(60);
      setOtp(Array(otpLength).fill('')); // ✅ Reset dynamic array
      // {salt : response.data.salt,mobileOtpSession : response.data.mobileOtpSession,expiryTime : response.data.otpGeneratedTime}
      Alert.alert('Success', 'Verification code sent successfully!');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={48} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Verification</Text>
            <Text style={styles.heroSubtitle}>Secure your account</Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <LinearGradient
                colors={['#EEF2FF', '#E0E7FF']}
                style={styles.illustrationCircle}
              >
                <Ionicons 
                  name={method === 'whatsapp' ? 'logo-whatsapp' : 'mail'} 
                  size={64} 
                  color="#667eea" 
                />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a {otpLength}-digit code to your {method === 'whatsapp' ? 'WhatsApp' : 'SMS'} number
            </Text>
            <Text style={styles.phoneNumber}> {phone}</Text>

            {/* OTP Input Boxes */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpInputWrapper}>
                  <TextInput
                    ref={ref => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      error && styles.otpInputError,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    selectTextOnFocus
                  />
                  {digit && (
                    <View style={styles.dotIndicator}>
                      <View style={styles.dot} />
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity 
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]} 
              onPress={() => handleVerifyOtp()} 
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
                    <Text style={styles.buttonText}>Verifying...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Verify Code</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity 
                onPress={handleResendOtp} 
                disabled={timer > 0 || resendLoading}
                activeOpacity={0.7}
              >
                {resendLoading ? (
                  <Text style={styles.resendLink}>Sending...</Text>
                ) : timer > 0 ? (
                  <Text style={styles.resendTimer}>Resend in {timer}s</Text>
                ) : (
                  <Text style={styles.resendLink}>Resend Code</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Change Number */}
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.changeNumberButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#667eea" />
              <Text style={styles.changeNumberText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
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
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  illustrationContainer: {
    marginBottom: 24,
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap', // ✅ For 6 digits: Wrap if screen small
  },
  otpInputWrapper: {
    position: 'relative',
  },
  otpInput: {
    width: 56,
    height: 64,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  otpInputFilled: {
    borderColor: '#667eea',
    backgroundColor: '#EEF2FF',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dotIndicator: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
    width: '100%',
  },
  errorText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
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
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '700',
  },
  resendTimer: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  changeNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  changeNumberText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
});

export default OTPScreen;

