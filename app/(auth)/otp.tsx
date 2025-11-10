// app/(auth)/otp.tsx - Enhanced OTP Verification Screen with Proper Resend
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  ActivityIndicator,
  Animated,
} from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { AccessToken } from '../Redux/action';
import { AppDispatch } from '../Redux/types';
import BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OTPScreen: React.FC = () => {
  const params = useLocalSearchParams<{ 
    phone: string; 
    method: string; 
    isRegister?: string; 
    countryCode: string; 
    salt: string; 
    mobileOtpSession: string; 
    expiryTime: string 
  }>();
  
  const [phone, setPhone] = useState(params.phone || '');
  const [method, setMethod] = useState(params.method || 'whatsapp');
  const [isRegister, setIsRegister] = useState(params.isRegister || 'false');
  const [countryCode, setCountryCode] = useState(params.countryCode || '91');
  const [salt, setSalt] = useState(params.salt || '');
  const [mobileOtpSession, setMobileOtpSession] = useState(params.mobileOtpSession || '');
  const [expiryTime, setExpiryTime] = useState(params.expiryTime || '');
  
  const otpLength = method === 'whatsapp' ? 4 : 6;
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();
  const isRegisterMode = isRegister === 'true';
  const dispatch = useDispatch<AppDispatch>();
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
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

    if (text && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

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
      let data;
      if (method === "whatsapp") {
        data = {
          countryCode: "+"+countryCode,
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
          countryCode: "+"+countryCode,
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
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      router.replace('/(screen)/(tabs)');
    } catch (err: any) {
      console.error('Verification error:', err.response?.data);
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
      setOtp(Array(otpLength).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      // ✅ Dynamic payload for resend (same as login/register)
      let data;
      if (method === "whatsapp") {
        data = {
          countryCode: "+" + countryCode,
          whatsappNumber: phone,
          userType: isRegisterMode ? 'Register' : 'Login',
          registrationType: "whatsapp",
        };
      } else {
        data = {
          countryCode: "+91", // For SMS, always use +91 as per your previous logic
          mobileNumber: phone,
          userType: isRegisterMode ? 'Register' : 'Login',
          registrationType: "sms",
        };
      }

      console.log('Resending OTP with data:', data);

      const response = await axios.post(
        `${BASE_URL}user-service/registerwithMobileAndWhatsappNumber`, 
        data
      );

      // ✅ Update all parameters with new response data
      if (response.data) {
        setSalt(response.data.salt || '');
        setMobileOtpSession(response.data.mobileOtpSession || '');
        setExpiryTime(response.data.otpGeneratedTime || '');
        
        // Show success message
        Alert.alert('Success', `Verification code sent to your ${method === 'whatsapp' ? 'WhatsApp' : 'SMS'}!`);
        
        // Reset OTP fields and timer
        setOtp(Array(otpLength).fill(''));
        setTimer(60);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error('Resend error:', err.response?.data);
      const errorMessage = err.response?.data?.error || 'Failed to resend code. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Function to format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Background with gradient effect - Same as Login/Register */}
      <View style={styles.background}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          {/* Hero Section - Same style */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Text style={styles.icon}>🔒</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Verification</Text>
            <Text style={styles.heroSubtitle}>Enter your verification code</Text>
          </View>

          {/* Main Card - Same style */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Verify Your Account</Text>
            <Text style={styles.instructionText}>
              We've sent a {otpLength}-digit {method === 'whatsapp' ? 'WhatsApp' : 'SMS'} code to
            </Text>
            <Text style={styles.phoneNumber}>+{countryCode} {formatPhoneNumber(phone)}</Text>

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
                </View>
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity 
              style={[
                styles.verifyButton, 
                loading && styles.verifyButtonDisabled,
                (otp.join('').length !== otpLength) && styles.verifyButtonDisabled
              ]} 
              onPress={() => handleVerifyOtp()} 
              disabled={loading || otp.join('').length !== otpLength}
              activeOpacity={0.8}
            >
              <View style={styles.buttonBackground}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Verifying...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Verify Code</Text>
                    <Text style={styles.buttonArrow}>→</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity 
                onPress={handleResendOtp} 
                disabled={timer > 0 || resendLoading}
                activeOpacity={0.7}
              >
                {resendLoading ? (
                  <Text style={styles.resendLinkDisabled}>Sending...</Text>
                ) : timer > 0 ? (
                  <Text style={styles.resendLinkDisabled}>Resend in {timer}s</Text>
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
              <Text style={styles.changeNumberText}>← Change Phone Number</Text>
            </TouchableOpacity>

            {/* Debug Info (remove in production) */}
            {/* <Text style={styles.debugText}>
              Salt: {salt ? '✓' : '✗'} | Session: {mobileOtpSession ? '✓' : '✗'} | Expiry: {expiryTime ? '✓' : '✗'}
            </Text> */}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Having trouble receiving the code? Try the {method === 'whatsapp' ? 'SMS' : 'WhatsApp'} method
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
    justifyContent: 'center',
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
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 22,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    width: '100%',
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
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    width: '100%',
  },
  verifyButtonDisabled: {
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 15,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '700',
  },
  resendLinkDisabled: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  changeNumberButton: {
    paddingVertical: 8,
  },
  changeNumberText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  debugText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default OTPScreen;