import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import axios, { AxiosResponse } from 'axios';
import * as Clipboard from 'expo-clipboard';
import BASE_URL from '../../../config';
import { useSelector } from 'react-redux';
import CoinsTransferrModal from '../Mycrypto/CoinsTransferrModal';
import BVMCoins from '../Mycrypto/BMVCoins';
import { RootState } from '../../Redux/types'; // Adjust path to your Redux types
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { logout } from '../../Redux/action/index'; // Adjust path
import { AppDispatch } from '@/app/Redux/types';
const jsonData = require('../../../app.json');

const { width } = Dimensions.get('window');

// Type for user data from Redux
interface UserData {
  accessToken: string;
  userId: string;
  // Add other fields as needed
}

// Type for menu items
interface MenuItem {
  id: number;
  icon?: string;
  type: 'Ionicons' | 'FontAwesome5' | 'MaterialCommunityIcons' | 'Feather' | 'divider';
  label?: string;
  showArrow?: boolean;
  navigation?: string;
  gradient?: string[];
}

// Type for form data
interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  whatsappNumber?: string;
  backupPhone?: string;
  phone?: string;
  status?: boolean;
}

// Props interface for the component
interface ProfileSettingsProps {
  navigation: NavigationProp<any>;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ navigation }) => {
  const [version, setVersion] = React.useState<string>('');
  const [dynamicContent, setDynamicContent] = React.useState<string | undefined>(undefined);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // App version info
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      setVersion(jsonData.expo.ios.buildNumber);
    } else {
      setVersion(jsonData.expo.android.versionCode.toString());
    }
  }, []);

  const userData = useSelector((state: RootState) => state.userData);
  const token: string | undefined = userData?.accessToken;
  const customerId: string | undefined = userData?.userId;

  // Updated settings menu items with new options
  const menuItems: MenuItem[] = [
     {
      id: 1,
      icon: 'award',
      type: 'Feather',
      label: 'Awards & Rewards',
      showArrow: true,
      navigation: '/userflow/Awards_Rewards',
      gradient: ['#F7971E', '#FFD200'] // gold/yellow hues, finance-friendly
    },
    {
      id: 1,
      icon: 'hand-coin',
      type: 'MaterialCommunityIcons',
      label: 'My Crypto',
      showArrow: true,
      navigation: '/Mycrypto/ViewHistoryBMVCoinsWallet',
      gradient: ['#00B4DB', '#0083B0'],
    },
    {
      id: 2,
      icon: 'user-plus',
      type: 'Feather',
      label: 'Invite',
      showArrow: true,
      navigation: '/invite/inviteAFriend',
      gradient: ['#7B61FF', '#4D2CFF'], // inviting purple
    },
    {
      id: 3,
      icon: 'refresh-cw',
      type: 'Feather',
      label: 'Referral History',
      navigation: '/invite/refferalHistory',
      showArrow: true,
      gradient: ['#00C9FF', '#92FE9D'],
    },

    { id: 4, type: 'divider' as const },
    {
      id: 5,
      icon: 'phone',
      type: 'Feather',
      label: 'Contact Us',
      showArrow: true,
      navigation: '/Contact/contactus',
      gradient: ['#00B4DB', '#0083B0'], // professional blue gradient
    },
    {
      id: 6,
      icon: 'information-circle-outline',
      type: 'Ionicons',
      label: 'Ticket History',
      showArrow: true,
      navigation: '/Contact/ticketHistory',
      gradient: ['#36D1DC', '#5B86E5'], // consistent with helpful/support tone
    },
    {id: 7, type: 'divider' as const},
    {
      id: 8,
      icon: 'user-x', 
      type: 'Feather', 
      label: 'DeActivate Account', 
      showArrow: true,
       gradient: ['#FF4B2B', '#FF416C'], // consistent with helpful/support tone
      navigation: '/AccountStatus/AccountActiveScreen',
    },
    {
      id: 9,
      icon: 'user-minus',
      type: 'Feather',
      label: 'Delete Account',
      showArrow: true,
      gradient: ['#8B0000', '#B22222'], // inviting purple
      navigation: '/AccountStatus/AccountDeleteScreen',
    },
    
  ];

  const [formData, setFormData] = React.useState<FormData>({} as FormData);
  const [profileLoader, setProfileLoader] = React.useState<boolean>(false);
  const [chainId, setChainId] = React.useState<string>('');
  const [coin, setCoin] = React.useState<string>('');
  const [copied, setCopied] = React.useState<boolean>(false);
  const [infoModalVisible, setInfoModalVisible] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<any>(null);
  const [bmvCoinModalVisible, setBmvCoinModalVisible] = React.useState<boolean>(false);
  const [coinValue, setCoinValue] = React.useState<number | undefined>(undefined);
  const [coinUsageDescription, setCoinUsageDescription] = React.useState<string>('');
  const [coinUsageShow, setCoinUsageShow] = React.useState<boolean>(false);

  const getInitials = (name: string | undefined): string => {
    return name?.charAt(0).toUpperCase() || '';
  };

  useFocusEffect(
    useCallback(() => {
      getProfile();
      profile();
      BVMCOinDescription();
      setCoinUsageDescription(
        `### ❓ Why are BMVCoins usable only on Non-GST Items?

We allow BMVCoins to be redeemed only on *non-GST items* to keep everything *100% tax-compliant and legally clear*.

Here's why:

* 🎯 *No tax = No conflict: Non-GST items have **zero tax*, so using rewards here doesn’t cause any loss to the government.
* 🔁 *It’s like cashback*: You're simply exchanging loyalty points for products that are already tax-free.
* 📜 *Fully transparent*: This ensures our rewards system stays compliant with Indian tax laws.

✅ Simple rule: BMVCoins = Rewards on tax-free items = Legally clean.`
      );
    }, [])
  );

  const handlingModal = (): void => {
    setInfoModalVisible(true);
    setCoinUsageShow(true);
  };

 const handleLogout = (): void => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.removeItem('userData'); // ✅ Clear persisted token
             console.log('Logout: Storage cleared');
            await dispatch(logout()); // ✅ Clears state/storage
            router.replace('/(auth)/login'); // Redirect to auth
          },
        },
      ]
    );
  };

  const profile = async (): Promise<void> => {
    console.log('userId', customerId);
    if (userData) {
      try {
        const response: AxiosResponse = await axios({
          method: 'get',
          url: BASE_URL + `user-service/getProfile/${customerId}`,
          // headers: {
          //   Authorization: `Bearer ${userData.accessToken}`,
          // },
        });
        console.log('get profile call response', response);
        setChainId(response.data.multiChainId);
        console.log(response.data.coinAllocated);
        setCoin(response.data.coinAllocated);
        CoinsValue(response.data.coinAllocated);
      } catch (error: any) {
        console.error('Error fetching profile:', error.response);
      }
    }
  };

  const BVMCOinDescription = async (): Promise<void> => {
    try {
      const response: AxiosResponse = await axios({
        method: 'get',
        url: BASE_URL + `user-service/allBmvDiscriptionData`,
        headers: {
          Authorization: `Bearer ${userData?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('response of description', response.data);
      const data = response.data;

      const targetId = `1ee1d800-45e2-4918-ac97-382a298dbf78`;
      const matched = data.find((item: any) => item.id === targetId);
      if (matched) {
        setDynamicContent(matched.discription);
      }
    } catch (error: any) {
      console.error('Error fetching description :', error.response);
    }
  };

  const CoinsValue = async (coin: string): Promise<void> => {
    if (coin) {
      try {
        const response: AxiosResponse = await axios({
          method: 'get',
          url: BASE_URL + `user-service/coinsToAmt?coins=${coin}`,
          headers: {
            Authorization: `Bearer ${userData?.accessToken}`,
          },
        });
        console.log('response of coins', response.data);
        setCoinValue(response.data);
      } catch (error: any) {
        console.error('Error fetching profile:', error.response);
      }
    }
  };

  const getProfile = async (): Promise<void> => {
    console.log('profile get call response');
    setProfileLoader(true);
    try {
      const response: AxiosResponse = await axios({
        method: 'GET',
        url: BASE_URL + `user-service/customerProfileDetails?customerId=${customerId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfileLoader(false);
      if (response.status === 200) {
        // setUser(response.data);
        console.log('response', response.data);

        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          whatsappNumber: response.data.whatsappNumber,
          backupPhone: response.data.alterMobileNumber.trim(' '),
          phone: response.data.mobileNumber,
          status: response.data.whatsappVerified,
        });
      }
    } catch (error: any) {
      setProfileLoader(false);
      console.error('ERROR', error.response);
    } finally {
      setProfileLoader(false);
    }
  };

  const truncateId = (id: string | undefined): string => {
    return id && id.length > 4 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id || '';
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await Clipboard.setStringAsync(chainId);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error: any) {
      console.error('Copy error:', error);
    }
  };

  // Render the correct icon based on type
  const renderIcon = (item: MenuItem): React.JSX.Element => {
    return (
      <LinearGradient
        colors={(item.gradient || ['#4C6FFF', '#6B8DFF']) as [string, string, ...string[]]}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {item.type === 'Ionicons' && item.icon && <Ionicons name={item.icon as any} size={16} color="#fff" />}
        {item.type === 'FontAwesome5' && item.icon && <FontAwesome5 name={item.icon as any} size={16} color="#fff" />}
        {item.type === 'MaterialCommunityIcons' && item.icon && <MaterialCommunityIcons name={item.icon as any} size={16} color="#fff" />}
        {item.type === 'Feather' && item.icon && <Feather name={item.icon as any} size={16} color="#fff" />}
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="always">
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#8A2BE2', '#4169E1']}
            style={styles.avatarContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>{getInitials(formData.firstName || '')}</Text>
          </LinearGradient>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {formData.firstName || ''} {formData.lastName || ''}
            </Text>
            <Text style={styles.profileEmail}>{formData.email}</Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/userflow/profileEdit')}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.editButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {userData && (
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoHeader}>
              <View style={styles.userInfoHeader}>
                <FontAwesome5 name="user-circle" size={20} color="#4A148C" />
                <Text style={styles.userInfoTitle}>Account Information</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <TouchableOpacity
                  style={styles.transferButton}
                  onPress={() => setBmvCoinModalVisible(true)}
                >
                  <Text style={styles.transferButtonText}>Transfer Coins</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.userInfoDivider} />

            <View>
              <View style={styles.blockchainIdContainer}>
                <View>
                  <Text style={styles.infoLabel}>
                    Blockchain ID:
                    <Text style={styles.infoValue}>{truncateId(chainId)}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyButton, copied ? styles.copiedButton : null]}
                  onPress={handleCopy}
                >
                  <MaterialIcons
                    name={copied ? 'check' : 'content-copy'}
                    size={16}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.coinContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: width * 0.4 }}>
                  <Text style={styles.infoLabel1}>BMV COINS:</Text>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinValue}>{coin}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => setInfoModalVisible(true)}
                >
                  <MaterialIcons name="info-outline" size={24} color="#4A148C" />
                </TouchableOpacity>
              </View>
              <View style={styles.coinContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: width * 0.4 }}>
                  <Text style={styles.infoLabel1}>BMV COINS Value:</Text>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinValue}>{coinValue?.toFixed(2) || '0.00'}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => handlingModal()}
                >
                  <MaterialIcons name="info-outline" size={24} color="#4A148C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Settings Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            if (item.type === 'divider') {
              return <View key={item.id} style={styles.divider} />;
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => item.navigation && router.push(`${item.navigation.replace(/\s+/g, '')}` as any)}
              >
                <View style={styles.menuItemLeft}>
                  {renderIcon(item)}
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#F56565', '#E53E3E']}
            style={styles.logoutButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="log-out" size={18} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Version Information */}
        <View style={styles.versionContainer}>
          <Feather name="code" size={14} color="#718096" style={styles.versionIcon} />
          <Text style={styles.versionText}>Version {version}</Text>
        </View>
      </ScrollView>
      {/* BMVCoins Info Modal */}

      <BVMCoins
        modalVisible={infoModalVisible}
        onCloseModal={() => {
          setInfoModalVisible(false);
          setCoinUsageShow(false);
        }}
        content={coinUsageShow ? coinUsageDescription : dynamicContent}
      />

      <CoinsTransferrModal
        visible={bmvCoinModalVisible}
        onClose={() => setBmvCoinModalVisible(false)}
        availableCoins={Number(coin) || 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    marginBottom: 60,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    fontFamily: 'Inter-Bold',
  },
  profileEmail: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  editButton: {
    marginTop: 16,
    width: '50%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  menuContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#2D3748',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 10,
    marginHorizontal: 12,
  },
  logoutButton: {
    marginTop: 24,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  logoutIcon: {
    marginRight: 8,
  },
  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
  },
  versionIcon: {
    marginRight: 6,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    width: width * 0.9,
    alignSelf: 'center',
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A148C',
    marginLeft: 10,
    fontFamily: 'Inter-Bold',
  },
  userInfoDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  blockchainIdContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    width: width * 0.6,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    fontFamily: 'Inter-Medium',
  },
  infoLabel1: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    alignItems: 'flex-start',
    fontFamily: 'Inter-Medium',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A148C',
    fontFamily: 'Inter-Bold',
  },
  copyButton: {
    backgroundColor: '#4A148C',
    padding: 6,
    borderRadius: 6,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    // marginLeft:width/3
  },
  copiedButton: {
    backgroundColor: '#4CAF50',
  },
  coinContainer: {
    // marginTop:50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coinBadge: {
    backgroundColor: '#F1F6FF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 6,
    // marginLeft:width/2.5
  },
  coinValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A148C',
    fontFamily: 'Inter-Bold',
  },
  infoButton: {
    padding: 4,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    // marginLeft:width/2.5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A148C',
    marginLeft: 10,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    backgroundColor: '#4A148C',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  valueBox: {
    backgroundColor: '#F1F6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  valueTitle: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  exchangeRate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A148C',
    marginLeft: 10,
    fontFamily: 'Inter-Bold',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  gotItButton: {
    backgroundColor: '#4A148C',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  gotItText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  transferButton: {
    backgroundColor: '#4A148C',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    // paddingVertical: 8,
    width: width * 0.2,
  },
});

export default ProfileSettings;

