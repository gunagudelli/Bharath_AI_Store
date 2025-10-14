import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/types'; // Adjust path to your Redux types

const { width } = Dimensions.get('window');

// Props interface (empty)
interface AccountStatusScreenProps {}

// Navigation param list (if needed, adjust)
type RootStackParamList = {
  // Add routes as needed
  Login: undefined;
  Support: undefined;
};

const AccountStatusScreen: React.FC<AccountStatusScreenProps> = () => {
  const userData = useSelector((state: RootState) => state.userData);
  const [isActive, setIsActive] = useState<boolean>(true); // Default to true (active)
  const navigation: NavigationProp<RootStackParamList> = useNavigation();

  // Fetch the account status when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAccountStatus();
    }, [])
  );

  const fetchAccountStatus = async (): Promise<void> => {
    try {
      const status = await AsyncStorage.getItem('userStatus');
      if (status === 'INACTIVE') {
        setIsActive(false);
      } else {
        setIsActive(true); // default is ACTIVE or null
      }
    } catch (e: any) {
      console.error('Error fetching status from storage:', e);
    }
  };

  const toggleAccountStatus = (): void => {
    Alert.alert(
      `${!isActive ? 'Activate' : 'Deactivate'} Account`,
      `Are you sure you want to ${!isActive ? 'activate' : 'deactivate'} your account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: handleAccountToggle },
      ]
    );
  };

  const handleAccountToggle = async (): Promise<void> => {
    try {
      const newStatus: string = !isActive ? 'ACTIVE' : 'INACTIVE';

      // Store new status locally (simulate API)
      await AsyncStorage.setItem('userStatus', newStatus);

      const message: string = !isActive
        ? 'Your account has been activated. You can now use the app as usual.'
        : 'Your account has been deactivated. It will be deleted within 3 to 4 working days unless reactivated. Please contact support for further assistance.';

      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStorage.removeItem('userData'); // logout
            navigation.navigate('Login');
          },
        },
      ]);

      setIsActive(!isActive);
    } catch (error: any) {
      console.error('Error updating account status:', error);
      Alert.alert('Error', 'Something went wrong while updating your account status.');
    }
  };

  const navigateToSupport = (): void => {
    navigation.navigate('Support');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.supportTopButton} onPress={navigateToSupport}>
        <Text style={styles.supportTopButtonText}>Support</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Manage Account Status</Text>
      <Text style={styles.instructions}>
        Your account is currently{' '}
        <Text style={{ fontWeight: 'bold', color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Active' : 'Inactive'}
        </Text>.
      </Text>

      <Text style={styles.note}>
        You can deactivate your account. Deactivation allows you to reactivate your account anytime within 7 days.
        If not reactivated, your account will be permanently deleted within 7 to 10 working days.
      </Text>

      <TouchableOpacity
        style={[styles.statusButton, isActive ? styles.deactivateButton : styles.activateButton]}
        onPress={toggleAccountStatus}
      >
        <Text style={styles.statusButtonText}>
          {isActive ? 'Deactivate Account' : 'Activate Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    width: width * 0.8,
  },
  note: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  statusButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  activateButton: {
    backgroundColor: '#007BFF',
  },
  deactivateButton: {
    backgroundColor: '#FF4C4C',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportTopButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  supportTopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AccountStatusScreen;