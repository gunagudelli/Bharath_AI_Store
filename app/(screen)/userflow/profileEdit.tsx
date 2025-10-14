import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios, { AxiosResponse } from 'axios';
import BASE_URL from '../../../config';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple toast replacement
const toast = {
  error: (message: string) => Alert.alert('Error', message),
  success: (message: string) => Alert.alert('Success', message),
  info: (message: string) => Alert.alert('Info', message),
};

// Simple Toaster component replacement
const Toaster: React.FC<{ position: string }> = () => null;

// Simple CountryPicker replacement
const CountryPicker: React.FC<any> = ({ visible, onClose, onSelect }) => {
  if (!visible) return null;
  
  const countries = [
    { callingCode: ['91'], name: 'India', flag: '🇮🇳' },
    { callingCode: ['1'], name: 'United States', flag: '🇺🇸' },
    { callingCode: ['44'], name: 'United Kingdom', flag: '🇬🇧' },
    { callingCode: ['61'], name: 'Australia', flag: '🇦🇺' },
    { callingCode: ['81'], name: 'Japan', flag: '🇯🇵' },
  ];
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.countryPickerModal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Country</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.countryList}>
          {countries.map((country, index) => (
            <TouchableOpacity
              key={index}
              style={styles.countryItem}
              onPress={() => onSelect(country)}
            >
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text style={styles.countryName}>{country.name}</Text>
              <Text style={styles.countryCode}>+{country.callingCode[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

// Interface for Profile Data from API
interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  whatsappNumber?: string;
  alterMobileNumber?: string;
  whatsappVerified?: boolean;
  mobileVerified?: boolean;
}

// Interface for UserState from Redux
interface UserState {
  accessToken: string;
  userId: string;
}

const ProfileScreen: React.FC = () => {
  // State management
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [alternativeNumber, setAlternativeNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  
  // Error states
  const [emailError, setEmailError] = useState<boolean>(false);
  const [whatsappNumberError, setWhatsappNumberError] = useState<boolean>(false);
  const [alternativeNumberError, setAlternativeNumberError] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<boolean>(false);
  
  // UI states
  const [isSameAsMain, setIsSameAsMain] = useState<boolean>(false);
  const [showWhatsappVerification, setShowWhatsappVerification] = useState<boolean>(false);
  const [whatsappVerified, setWhatsappVerified] = useState<boolean>(false);
  const [mobileVerified, setMobileVerified] = useState<boolean>(false);
  const [isLoginWithWhatsapp, setIsLoginWithWhatsapp] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string>('91');
  const [countryPickerVisible, setCountryPickerVisible] = useState<boolean>(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileLoader, setProfileLoader] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  
  // OTP verification data
  const [otpSession, setOtpSession] = useState<string>('');
  const [salt, setSalt] = useState<string>('');
  
  // Get user data from Redux store
  const userData = useSelector<RootState, UserState>((state) => state.userData as UserState);
  const token = userData?.accessToken;
  const customerId = userData?.userId;

  // Fetch profile data on mount
  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async (): Promise<void> => {
    setProfileLoader(true);
    try {
      const response: AxiosResponse<ProfileData> = await axios({
        method: "GET",
        url: BASE_URL + `user-service/customerProfileDetails?customerId=${customerId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setWhatsappVerified(response.data.whatsappVerified || false);
      setMobileVerified(response.data.mobileVerified || false);
      if (response.data.whatsappVerified) {
        setIsLoginWithWhatsapp(true);
      }
      
      if (response.status === 200) {
        setFirstName(response.data.firstName || '');
        setLastName(response.data.lastName || '');
        setEmail(response.data.email || '');
        setMobileNumber(response.data.mobileNumber || '');
        setWhatsappNumber(response.data.whatsappNumber || '');
        setAlternativeNumber(response.data.alterMobileNumber?.trim() || '');
      }
    } catch (error: any) {
      console.error("ERROR", error);
      toast.error("Failed to load profile data");
    } finally {
      setProfileLoader(false);
    }
  };

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const validatePhoneNumber = (number: string): boolean => {
    return number.length === 10 && /^\d+$/.test(number);
  };

  // Handle sending WhatsApp OTP
  const handleSendOtp = (): void => {
    if (whatsappVerified) {
      toast.info('WhatsApp number already verified');
      return;
    }
    
    if (!whatsappNumber) {
      setWhatsappNumberError(true);
      toast.error('Please enter WhatsApp number');
      return;
    }
    
    if (!validatePhoneNumber(whatsappNumber)) {
      setWhatsappNumberError(true);
      toast.error('WhatsApp number must be 10 digits');
      return;
    }
    
    const data = {
      countryCode: "+" + countryCode,
      chatId: whatsappNumber,
      id: customerId,
    };
    
    setOtpLoading(true);
    
    axios({
      method: "post",
      url: BASE_URL + `user-service/sendWhatsappOtpqAndVerify`,
      data: data,
    })
      .then((response: AxiosResponse) => {
        if (!response.data.whatsappOtpSession || !response.data.salt) {
          toast.error("This WhatsApp number already exists");
        } else {
          setShowWhatsappVerification(true);
          setWhatsappNumberError(false);
          setOtpSession(response.data.whatsappOtpSession);
          setSalt(response.data.salt);
          toast.success("OTP sent successfully");
        }
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.message || "Failed to send OTP");
      })
      .finally(() => {
        setOtpLoading(false);
      });
  };

  // Handle OTP verification
  const handleVerifyOtp = (): void => {
    if (!whatsappNumber) {
      setWhatsappNumberError(true);
      toast.error("Please enter WhatsApp number");
      return;
    }
    
    if (!validatePhoneNumber(whatsappNumber)) {
      setWhatsappNumberError(true);
      toast.error("Please enter a valid 10-digit WhatsApp number");
      return;
    }
    
    if (!otp) {
      setOtpError(true);
      toast.error("Please enter OTP");
      return;
    }

    if (otp.length < 4 || otp.length > 5) {
      setOtpError(true);
      toast.error("Please enter a valid OTP");
      return;
    }
    
    const data = {
      countryCode: "+" + countryCode,
      chatId: whatsappNumber,
      id: customerId,
      salt: salt,
      whatsappOtp: otp,
      whatsappOtpSession: otpSession,
    };
    
    setOtpLoading(true);
    
    axios({
      method: "post",
      url: BASE_URL + `user-service/sendWhatsappOtpqAndVerify`,
      data: data,
    })
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          toast.success("WhatsApp number verified successfully");
          setWhatsappVerified(true);
        }
        
        setShowWhatsappVerification(false);
        setOtp('');
        setWhatsappNumberError(false);
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
      })
      .finally(() => {
        setOtpLoading(false);
      });
  };

  // Handle same number toggle
  const handleSameNumberToggle = (): void => {
    if ((whatsappVerified && mobileVerified) || (!whatsappVerified && !mobileVerified)) {
      const newValue = !isSameAsMain;
      setIsSameAsMain(newValue);
      
      if (isLoginWithWhatsapp) {
        if (newValue) {
          setMobileNumber(whatsappNumber);
        } else {
          setMobileNumber('');
        }
      } else {
        if (newValue) {
          setWhatsappNumber(mobileNumber);
          setShowWhatsappVerification(false);
        } else {
          setWhatsappNumber('');
        }
      }
    } else {
      toast.error('Cannot make numbers the same when one is verified and the other is not');
    }
  };

  // Submit profile data
  const handleSubmit = async (): Promise<void> => {
    if (firstName === "" || firstName == null) {
      Alert.alert("First Name is required");
      return;
    }
    
    if (mobileNumber === "" || mobileNumber == null) {
      Alert.alert("Mobile Number is required");
      return;
    }
  
    if (mobileNumber === alternativeNumber) {
      Alert.alert("Mobile Number and Alternative Number should not be same");
      return;
    }

    setIsLoading(true);
    
    const data = {
      userFirstName: firstName,
      userLastName: lastName,
      customerEmail: email,
      customerId: customerId,
      alterMobileNumber: alternativeNumber,
      whatsappNumber: whatsappVerified ? whatsappNumber : (isSameAsMain ? mobileNumber : whatsappNumber || ""),
      mobileNumber: mobileVerified ? mobileNumber : mobileNumber,
    };
    
    try { 
      const response: AxiosResponse = await axios.patch(
        BASE_URL + "user-service/profileUpdate",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.errorMessage) {
        Alert.alert("Failed", response.data.errorMessage);
      } else {
        getProfile();
        Alert.alert("Success", "Profile saved successfully");
      }
    } catch (error: any) {
      console.error(error.response);
      Alert.alert("Failed", error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle country selection
  const onSelectCountry = (country: any): void => {
    setCountryCode(country.callingCode[0]);
    setCountryPickerVisible(false);
  };

  // Render verified badge component
  const VerifiedBadge: React.FC<{ verified: boolean }> = ({ verified }) => (
    <View style={styles.verifiedBadge}>
      <MaterialIcons name="verified" size={16} color="#10b981" />
      <Text style={styles.verifiedText}>Verified</Text>
    </View>
  );

  // Render phone input row
  const PhoneInputRow: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    editable: boolean;
    error?: boolean;
    verified?: boolean;
    placeholder: string;
    showCountryPicker?: boolean;
    disabled?: boolean;
  }> = ({
    label,
    value,
    onChangeText,
    editable,
    error,
    verified,
    placeholder,
    showCountryPicker = false,
    disabled = false,
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {verified && <VerifiedBadge verified={verified} />}
      </View>
      <View style={styles.phoneInputContainer}>
        {showCountryPicker && (
          <TouchableOpacity
            style={[
              styles.countryCodeButton,
              verified && styles.countryCodeButtonDisabled
            ]}
            onPress={() => !verified && setCountryPickerVisible(true)}
            disabled={verified || disabled}
          >
            <Text style={styles.countryCodeText}>+{countryCode}</Text>
            {!verified && !disabled && (
              <MaterialIcons name="arrow-drop-down" size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        )}
        <TextInput
          style={[
            styles.phoneInput, 
            error && styles.inputError,
            verified && styles.verifiedInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
          editable={!verified && !disabled}
        />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={14} color="#ef4444" />
          <Text style={styles.errorText}>Please enter a valid {label.toLowerCase()}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <Toaster position="top" />
        
        {countryPickerVisible && (
          <CountryPicker
            visible={countryPickerVisible}
            onClose={() => setCountryPickerVisible(false)}
            onSelect={onSelectCountry}
          />
        )}
        
        {/* Loading Overlay */}
        {(profileLoader || isLoading || otpLoading) && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>
                {profileLoader ? 'Loading...' : isLoading ? 'Saving...' : 'Verifying...'}
              </Text>
            </View>
          </View>
        )}
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header */}
          {/* <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={40} color="#3b82f6" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Profile Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your personal information</Text>
          </View> */}

          {/* Personal Information Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="person-outline" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, emailError && styles.inputError]}
                  value={email}
                  onChangeText={(text: string) => {
                    setEmail(text);
                    setEmailError(false);
                  }}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError && (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>Please enter a valid email</Text>
                </View>
              )}
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="phone" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            
            {/* Primary Number */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>
                  {isLoginWithWhatsapp ? 'WhatsApp Number' : 'Mobile Number'} <Text style={styles.required}>*</Text>
                </Text>
                {(isLoginWithWhatsapp ? whatsappVerified : mobileVerified) && (
                  <VerifiedBadge verified={true} />
                )}
              </View>
              <View style={styles.inputWrapper}>
                <FontAwesome6  
                  name={isLoginWithWhatsapp ? "whatsapp" : "phone-android"} 
                  size={20} 
                  color="#9ca3af" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[
                    styles.inputWithIcon, 
                    styles.disabledInput,
                    (isLoginWithWhatsapp ? whatsappVerified : mobileVerified) && styles.verifiedInput
                  ]}
                  value={isLoginWithWhatsapp ? whatsappNumber : mobileNumber}
                  placeholder="Enter number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  editable={false}
                />
              </View>
            </View>

            {/* Same Number Toggle */}
            {((whatsappVerified && mobileVerified) || (!whatsappVerified && !mobileVerified)) && (
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={handleSameNumberToggle}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSameAsMain && styles.checkboxChecked]}>
                  {isSameAsMain && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  {isLoginWithWhatsapp ? 'Same as mobile number' : 'Same as WhatsApp number'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Secondary Number */}
            {!isSameAsMain && (
              <>
                {!isLoginWithWhatsapp && (
                  <PhoneInputRow
                    label="WhatsApp Number"
                    value={whatsappNumber}
                    onChangeText={(text: string) => {
                      if (/^\d*$/.test(text) && text.length <= 10) {
                        setWhatsappNumber(text);
                        setWhatsappNumberError(false);
                      }
                    }}
                    editable={!whatsappVerified}
                    error={whatsappNumberError}
                    verified={whatsappVerified}
                    placeholder="WhatsApp number"
                    showCountryPicker={true}
                  />
                )}
                
                {isLoginWithWhatsapp && (
                  <PhoneInputRow
                    label="Mobile Number"
                    value={mobileNumber}
                    onChangeText={(text: string) => {
                      if (/^\d*$/.test(text) && text.length <= 10) {
                        setMobileNumber(text);
                      }
                    }}
                    editable={!mobileVerified}
                    verified={mobileVerified}
                    placeholder="Enter mobile number"
                  />
                )}
              </>
            )}
            
            {/* Alternative Number */}
            <PhoneInputRow
              label="Alternative Number"
              value={alternativeNumber}
              onChangeText={(text: string) => {
                if (/^\d*$/.test(text) && text.length <= 10) {
                  setAlternativeNumber(text);
                  setAlternativeNumberError(false);
                }
              }}
              editable={true}
              error={alternativeNumberError}
              placeholder="Alternative number (optional)"
              showCountryPicker={true}
            />

            {/* Verify WhatsApp Button */}
            {!isLoginWithWhatsapp && !whatsappVerified && !isSameAsMain && whatsappNumber && (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleSendOtp}
                disabled={otpLoading}
                activeOpacity={0.8}
              >
                <MaterialIcons name="verified-user" size={20} color="white" />
                <Text style={styles.verifyButtonText}>
                  {otpLoading ? 'Sending OTP...' : 'Verify WhatsApp Number'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* WhatsApp Verification Card */}
          {showWhatsappVerification && (
            <View style={[styles.card, styles.verificationCard]}>
              <View style={styles.verificationHeader}>
                <View style={styles.verificationIconContainer}>
                  <MaterialIcons name="lock-outline" size={32} color="#3b82f6" />
                </View>
                <Text style={styles.verificationTitle}>Verification Code</Text>
                <Text style={styles.verificationText}>
                  We've sent a verification code to your WhatsApp number ending in {whatsappNumber.slice(-4)}
                </Text>
              </View>
              
              <View style={styles.otpInputContainer}>
                <TextInput
                  style={[styles.otpInput, otpError && styles.inputError]}
                  value={otp}
                  onChangeText={(text: string) => {
                    if (/^\d*$/.test(text) && text.length <= 5) {
                      setOtp(text);
                      setOtpError(false);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="• • • • •"
                  placeholderTextColor="#d1d5db"
                  textAlign="center"
                />
              </View>
              
              {otpError && (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error-outline" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>Please enter a valid OTP</Text>
                </View>
              )}
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowWhatsappVerification(false)}
                  disabled={otpLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleVerifyOtp}
                  disabled={otpLoading || !otp}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="check-circle" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>
                    {otpLoading ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <MaterialIcons name="save" size={22} color="white" />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    fontSize: 15,
    color: '#111827',
  },
  inputWithIcon: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  verifiedInput: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  phoneInputContainer: {
    flexDirection: 'row',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginRight: 12,
    minWidth: 95,
  },
  countryCodeButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  countryCodeText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    marginRight: 2,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    fontSize: 15,
    color: '#111827',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  verificationCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verificationIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpInputContainer: {
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#f9fafb',
    paddingVertical: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#3b82f6',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 14,
    marginLeft: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 14,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 60,
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  verifiedText: {
    color: '#065f46',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  loadingCard: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  countryPickerModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default ProfileScreen;