import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/types'; // Adjust path to your Redux types
import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config';

const { height, width } = Dimensions.get('window');

// Interface for user data from Redux
interface UserData {
  accessToken: string;
  userId: string;
  // Add other fields as needed
}

// Interface for referee item in the list
interface RefereeItem {
  id: string;
  whatsappnumber: string;
  created_at: [number, number, number]; // Assuming array format [year, month, day]
  referenceStatus: string;
  // Add other fields as needed
}

// Interface for API response (array of RefereeItem)
interface RefereesResponse {
  data: RefereeItem[];
}

// Props interface (empty)
interface ReferralHistoryProps {}

// Helper function to format date (typed)
const formatDate = (dateArray: [number, number, number] | undefined): string => {
  if (Array.isArray(dateArray) && dateArray.length >= 3) {
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return 'N/A';
};

const ReferralHistory: React.FC<ReferralHistoryProps> = () => {
  const userData = useSelector((state: RootState) => state.userData);
  const token: string | undefined = userData?.accessToken;
  const customerId: string | undefined = userData?.userId;
  const [refereesData, setRefereesData] = useState<RefereeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getRefereeDetails();
  }, []);

  function getRefereeDetails(): void {
    setLoading(true);
    axios({
      method: 'get',
      url: BASE_URL + `reference-service/getreferencedetails/${customerId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response: AxiosResponse<RefereesResponse>) => {
        setLoading(false);
        console.log('response', response.data);
        setRefereesData(response.data.data || []);
      })
      .catch((error: any) => {
        setLoading(false);
        console.log(error.response);
      });
  }

  const renderStatusBadge = (status: string): React.JSX.Element => {
    console.log('referral status', status);

    let badgeStyle = styles.statusContainer;
    let textStyle = styles.statusText;

    switch (status) {
      case 'REGISTERED':
        badgeStyle = { ...badgeStyle, backgroundColor: '#E8F5E9' } as any;
        textStyle = { ...textStyle, color: '#2E7D32' } as any;
        break;
      case 'Invited':
        badgeStyle = { ...badgeStyle, backgroundColor: '#E3F2FD' } as any;
        textStyle = { ...textStyle, color: '#1565C0' } as any;
        break;
      default: // Invited
        badgeStyle = { ...badgeStyle, backgroundColor: '#FFF8E1' } as any;
        textStyle = { ...textStyle, color: '#F9A825' } as any;
        break;
    }

    return (
      <View style={badgeStyle}>
        <Text style={textStyle}>{status}</Text>
      </View>
    );
  };

  const renderRefereeItem = ({ item }: { item: RefereeItem }): React.JSX.Element => (
    <View style={styles.card}>
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>WhatsApp Number</Text>
          <Text style={styles.detailValue}>{item.whatsappnumber}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Referred Date</Text>
          <Text style={styles.detailValue}>{formatDate(item?.created_at)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Status</Text>
          {renderStatusBadge(item?.referenceStatus)}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar style="dark" /> */}
      {/* Referees List */}

      {!loading ? (
        <View>
          {refereesData.length > 0 ? (
            <FlatList
              data={refereesData}
              renderItem={renderRefereeItem}
              keyExtractor={(item: RefereeItem) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={{ marginTop: 30, alignSelf: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>No Data Found</Text>
            </View>
          )}
        </View>
      ) : (
        <ActivityIndicator size="large" color="#3d2a71" />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerAction: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    paddingVertical: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '500',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  cardActionText: {
    color: '#3366cc',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    backgroundColor: '#3366cc',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ReferralHistory;