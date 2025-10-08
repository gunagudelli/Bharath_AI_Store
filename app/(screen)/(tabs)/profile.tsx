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
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios, { AxiosResponse } from 'axios';
import BASE_URL from '../../../config';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/types';

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
    { callingCode: ['91'], name: 'India' },
    { callingCode: ['1'], name: 'United States' },
    { callingCode: ['44'], name: 'United Kingdom' },
  ];
  
  return (
    <View style={{
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      zIndex: 1000,
      elevation: 10,
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select Country</Text>
      {countries.map((country, index) => (
        <TouchableOpacity
          key={index}
          style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
          onPress={() => onSelect(country)}
        >
          <Text>+{country.callingCode[0]} {country.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={{ marginTop: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}
        onPress={onClose}
      >
        <Text style={{ textAlign: 'center' }}>Close</Text>
      </TouchableOpacity>
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

// Interface for UserState from Redux (adjust as per your store)
interface UserState {
  accessToken: string;
  userId: string;
  // Add other fields if needed
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
      
      // Update verification statuses
      setWhatsappVerified(response.data.whatsappVerified || false);
      setMobileVerified(response.data.mobileVerified || false);
      if (response.data.whatsappVerified) {
        setIsLoginWithWhatsapp(true);
      }
      
      if (response.status === 200) {
        // Update form fields
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
    // Don't allow sending OTP if WhatsApp number is already verified
    if (whatsappVerified) {
      toast.info('WhatsApp number already verified');
      return;
    }
    
    // Validate WhatsApp number
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
        if (
          !response.data.whatsappOtpSession ||
          !response.data.salt
        ) {
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
    // Validate WhatsApp number again
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
    
    // Validate OTP
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
        toast.error(
          error.response?.data?.message ||
            "Invalid OTP. Please try again."
        );
      })
      .finally(() => {
        setOtpLoading(false);
      });
  };

  // Handle same number toggle
  const handleSameNumberToggle = (): void => {
    // Only allow toggling if neither number is verified or both are verified
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

  // Render verified badge component (reusable)
  const VerifiedBadge: React.FC<{ verified: boolean }> = ({ verified }) => (
    <View style={styles.verifiedBadge}>
      <MaterialIcons name="check-circle" size={14} color="#28a745" />
      <Text style={styles.verifiedText}>Verified</Text>
    </View>
  );

  // Render phone input row (reusable)
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
              !verified ? {} : { backgroundColor: '#f0f0f0' }
            ]}
            onPress={() => !verified && setCountryPickerVisible(true)}
            disabled={verified || disabled}
          >
            <Text style={styles.countryCodeText}>+{countryCode}</Text>
            {!verified && !disabled && (
              <MaterialIcons name="arrow-drop-down" size={24} color="#444" />
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
          keyboardType="phone-pad"
          maxLength={10}
          editable={!verified && !disabled}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>Please enter a valid {label.toLowerCase()}</Text>
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
            withCallingCode={true}
            withFilter={true}
            withFlag={true}
            withAlphaFilter={true}
          />
        )}
        
        {/* Loading Overlay */}
        {(profileLoader || isLoading || otpLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header */}
          {/* <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile Settings</Text>
            <Text style={styles.headerSubtitle}>Update your personal information</Text>
          </View> */}

          {/* Personal Information Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
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
              />
            </View>
            
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text);
                  setEmailError(false);
                }}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError && (
                <Text style={styles.errorText}>Please enter a valid email</Text>
              )}
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {/* Primary Number (Mobile or WhatsApp based on login method) */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>
                  {isLoginWithWhatsapp ? 'WhatsApp Number' : 'Mobile Number'} *
                </Text>
                {(isLoginWithWhatsapp ? whatsappVerified : mobileVerified) && (
                  <VerifiedBadge verified={true} />
                )}
              </View>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: '#f0f0f0' },
                  (isLoginWithWhatsapp ? whatsappVerified : mobileVerified) && styles.verifiedInput
                ]}
                value={isLoginWithWhatsapp ? whatsappNumber : mobileNumber}
                placeholder="Enter number"
                keyboardType="phone-pad"
                editable={false}
              />
            </View>

            {/* Same Number Toggle */}
            {((whatsappVerified && mobileVerified) || (!whatsappVerified && !mobileVerified)) && (
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={handleSameNumberToggle}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSameAsMain }}
              >
                <MaterialIcons 
                  name={isSameAsMain ? "check-box" : "check-box-outline-blank"} 
                  size={24} 
                  color="#007AFF"
                />
                <Text style={styles.checkboxLabel}>
                  {isLoginWithWhatsapp ? 'Same as mobile number' : 'Same as WhatsApp number'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Secondary Number (WhatsApp or Mobile based on login method) */}
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
              placeholder="Alternative number"
              showCountryPicker={true}
            />

            {/* Verify WhatsApp Button (only if not verified and secondary is WhatsApp) */}
            {!isLoginWithWhatsapp && !whatsappVerified && !isSameAsMain && (
              <TouchableOpacity 
                style={[styles.button, styles.verifyButton]}
                onPress={handleSendOtp}
                disabled={otpLoading}
                accessibilityRole="button"
                accessibilityLabel="Verify WhatsApp"
              >
                <Text style={styles.buttonText}>
                  {otpLoading ? 'Sending...' : 'Verify WhatsApp'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* WhatsApp Verification Modal (Inline Card for Better UX) */}
          {showWhatsappVerification && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>WhatsApp Verification</Text>
              <Text style={styles.verificationText}>
                Enter the verification code sent to your WhatsApp
              </Text>
              
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
                placeholder="Enter OTP"
                textAlign="center"
                accessibilityLabel="OTP Input"
              />
              
              {otpError && (
                <Text style={styles.errorText}>Please enter a valid OTP</Text>
              )}
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowWhatsappVerification(false)}
                  disabled={otpLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel Verification"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleVerifyOtp}
                  disabled={otpLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Verify OTP"
                >
                  <Text style={styles.buttonText}>
                    {otpLoading ? 'Verifying...' : 'Verify Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Save Profile"
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Saving...' : 'Save Profile'}
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
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 25
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  verifiedInput: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  phoneInputContainer: {
    flexDirection: 'row',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
    width: 100,
    minWidth: 100,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#374151',
    marginRight: 4,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#1f2937',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  otpInput: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  verificationText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  verifyButton: {
    backgroundColor: '#10b981',
    marginTop: 12,
    alignSelf: 'center',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 32,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifiedText: {
    color: '#166534',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
  },
});

export default ProfileScreen;