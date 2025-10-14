import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';
import { RootState } from '../../Redux/types'; // Adjust path to your Redux types
import BmvCoinsFaq from './BmvCoinsFaq';
import { getTransferrMobileNumbers } from './CoinsTransferrModal';

const { width } = Dimensions.get('window');

// Interface for transaction item
interface Transaction {
  id?: string; // Optional for keyExtractor
  type: 'debit' | 'credit';
  amountTransfer: number;
  rxMobileNumber?: string;
  txMobileNumber?: string;
  timestamp?: string;
  // Add other fields as needed
}

// Props for TransactionCard
interface TransactionCardProps {
  item: Transaction;
  onViewDetails: (transaction: Transaction) => void;
  onShareTransaction: (transaction: Transaction) => void;
}

// Props for TransactionDetailsModal and ShareTransactionModal
interface TransactionModalProps {
  isVisible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

// Main component props (none, but for consistency)
interface ViewCoinsTransferHistoryProps {}

// Helper function to format date (typed)
const formatDate = (timestamp: string | undefined): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  item,
  onViewDetails,
  onShareTransaction,
}) => (
  <TouchableOpacity
    style={[
      styles.card,
      item.type === 'debit' ? styles.debitCard : styles.creditCard,
    ]}
    onPress={() => onViewDetails(item)}
  >
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <View
          style={[
            styles.iconContainer,
            item.type === 'debit' ? styles.debitIcon : styles.creditIcon,
          ]}
        >
          {item.type === 'debit' ? (
            <MaterialIcons name="arrow-upward" size={18} color="#fff" />
          ) : (
            <MaterialIcons name="arrow-downward" size={18} color="#fff" />
          )}
        </View>
        <View>
          <Text style={styles.transactionType}>
            {item.type === 'debit' ? 'Sent' : 'Received'}
          </Text>
          {/* <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text> */}
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.valueAmount,
            item.type === 'debit' ? styles.debitText : styles.creditText,
          ]}
        >
          {item.type === 'debit' ? '-' : '+'}
          {item.amountTransfer}
        </Text>
        <Text style={styles.coinText}>BMVCoins</Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.cardBody}>
      <View style={styles.recipientRow}>
        <Text style={styles.label}>
          {item.type === 'debit' ? 'Sent to:' : 'Received from:'}
        </Text>
        <Text style={styles.value}>
          {item.type === 'debit' ? item.rxMobileNumber : item.txMobileNumber}
        </Text>
      </View>

      {/* <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => onShareTransaction(item)}
      >
        <Ionicons name="share-social-outline" size={16} color="#6A0DAD" />
        <Text style={styles.viewDetailsText}>Share</Text>
      </TouchableOpacity> */}
    </View>
  </TouchableOpacity>
);

const TransactionDetailsModal: React.FC<TransactionModalProps> = ({
  isVisible,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.transactionSummary}>
              <View
                style={[
                  styles.iconContainerLarge,
                  transaction.type === 'debit'
                    ? styles.debitIcon
                    : styles.creditIcon,
                ]}
              >
                {transaction.type === 'debit' ? (
                  <MaterialIcons name="arrow-upward" size={24} color="#fff" />
                ) : (
                  <MaterialIcons name="arrow-downward" size={24} color="#fff" />
                )}
              </View>
              <Text style={styles.transactionTypeModal}>
                {transaction.type === 'debit' ? 'Sent' : 'Received'}
              </Text>
              <Text
                style={[
                  styles.amountLarge,
                  transaction.type === 'debit'
                    ? styles.debitText
                    : styles.creditText,
                ]}
              >
                {transaction.type === 'debit' ? '-' : '+'}
                {transaction.amountTransfer}
              </Text>
              <Text style={styles.coinTextModal}>BMVCoins</Text>
              {/* <Text style={styles.dateTextModal}>
                {formatDate(transaction.timestamp)}
              </Text> */}
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {transaction.type === 'debit' ? 'Recipient:' : 'Sender:'}
                </Text>
                <Text style={styles.detailValue}>
                  {transaction.type === 'debit'
                    ? transaction.rxMobileNumber
                    : transaction.txMobileNumber}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ShareTransactionModal: React.FC<TransactionModalProps> = ({
  isVisible,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.shareModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.shareModalBody}>
            <View style={styles.qrPlaceholder}>
              <FontAwesome5 name="qrcode" size={100} color="#6A0DAD" />
            </View>

            <Text style={styles.shareInfoText}>
              Scan this QR code to view transaction details or share using the
              options below
            </Text>

            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption}>
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#25D366' },
                  ]}
                >
                  <FontAwesome5 name="whatsapp" size={20} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#3b5998' },
                  ]}
                >
                  <FontAwesome5 name="facebook" size={20} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#0088cc' },
                  ]}
                >
                  <FontAwesome5 name="telegram" size={20} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>Telegram</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <View
                  style={[
                    styles.shareIconContainer,
                    { backgroundColor: '#555' },
                  ]}
                >
                  <MaterialIcons name="more-horiz" size={20} color="#fff" />
                </View>
                <Text style={styles.shareOptionText}>More</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ViewCoinsTransferHistory: React.FC<ViewCoinsTransferHistoryProps> = () => {
  const userData = useSelector((state: RootState) => state.userData);
  const mobileNumber: string | undefined = userData?.mobileNumber;
  const whatsappNumber: string | undefined = userData?.whatsappNumber;
  const whatsappwithoutcountry: string | undefined = whatsappNumber?.slice(3);

  const [historyData, setHistoryData] = useState<Transaction[]>([]);
  const [debitedData, setDebitedData] = useState<Transaction[]>([]);
  const [creditedData, setCreditedData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [bmvCoinsModalVisible, setBmvCoinsModalVisible] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    const fromMobile: string = mobileNumber || whatsappwithoutcountry || '';
    try {
      const response = await getTransferrMobileNumbers(fromMobile);
      console.log('Transfer history response:', response);

      // Add timestamps if not present (for demo purposes)
      // const dataWithTimestamps = response?.map((item: Transaction) => ({
      //   ...item,
      //   timestamp:
      //     item.timestamp ||
      //     new Date(
      //       Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
      //     ).toISOString(),
      // }));

      // const sortedData = dataWithTimestamps?.sort(
      //   (a: Transaction, b: Transaction) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
      // );

      setHistoryData(response || []);

      // Separate debited and credited transactions
      const debited: Transaction[] = (response || []).filter((item: Transaction) => item.type === 'debit');
      const credited: Transaction[] = (response || []).filter((item: Transaction) => item.type === 'credit');

      setDebitedData(debited);
      setCreditedData(credited);
    } catch (error: any) {
      console.error('Failed to fetch transfer history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleViewDetails = (transaction: Transaction): void => {
    setSelectedTransaction(transaction);
    setDetailsModalVisible(true);
  };

  const handleShareTransaction = (transaction: Transaction): void => {
    setSelectedTransaction(transaction);
    setShareModalVisible(true);
  };

  const renderItem = ({ item }: { item: Transaction }): React.JSX.Element => (
    <TransactionCard
      item={item}
      onViewDetails={handleViewDetails}
      onShareTransaction={handleShareTransaction}
    />
  );

  const getActiveData = (): Transaction[] => {
    switch (activeTab) {
      case 'sent':
        return debitedData;
      case 'received':
        return creditedData;
      default:
        return historyData;
    }
  };

  const EmptyListComponent = (): React.JSX.Element => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No transactions found</Text>
      <Text style={styles.emptySubText}>
        {activeTab === 'sent'
          ? "You haven't sent any BMVCoins yet"
          : activeTab === 'received'
          ? "You haven't received any BMVCoins yet"
          : 'Your transaction history will appear here'}
      </Text>
    </View>
  );

  const renderHeader = (): React.JSX.Element => (
    <View style={styles.headerContainer}>
      {/* <Text style={styles.heading}>Transaction History</Text> */}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Sent</Text>
          <Text style={styles.statValueDebit}>
            {debitedData
              .reduce((total: number, tx: Transaction) => total + Number(tx.amountTransfer), 0)
              .toFixed(2)}{' '}
            BMV
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Received</Text>
          <Text style={styles.statValueCredit}>
            {creditedData
              .reduce((total: number, tx: Transaction) => total + Number(tx.amountTransfer), 0)
              .toFixed(2)}{' '}
            BMV
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
        <TouchableOpacity onPress={() => setBmvCoinsModalVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>FAQs</Text>
        </TouchableOpacity>
        <Ionicons name="information-circle" size={24} color="#fff" style={{ marginLeft: 4,top:4 }} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6A0DAD" />
          <Text style={styles.loadingText}>Loading your transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={getActiveData()}
          keyExtractor={(item: Transaction, index: number) => item.id || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={EmptyListComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6A0DAD']}
            />
          }
        />
      )}

      <TransactionDetailsModal
        isVisible={detailsModalVisible}
        transaction={selectedTransaction}
        onClose={() => setDetailsModalVisible(false)}
      />

      <ShareTransactionModal
        isVisible={shareModalVisible}
        transaction={selectedTransaction}
        onClose={() => setShareModalVisible(false)}
      />
      <BmvCoinsFaq
        visible={bmvCoinsModalVisible}
        onClose={() => setBmvCoinsModalVisible(false)}
      />
    </View>
  );
};

export default ViewCoinsTransferHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  headerContainer: {
    paddingHorizontal: 16,
    // paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#6A0DAD',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statValueDebit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statValueCredit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6A0DAD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#6A0DAD',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
  },
  debitCard: {
    borderLeftColor: '#F44336',
  },
  creditCard: {
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  debitIcon: {
    backgroundColor: '#F44336',
  },
  creditIcon: {
    backgroundColor: '#4CAF50',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  debitText: {
    color: '#F44336',
  },
  creditText: {
    color: '#4CAF50',
  },
  coinText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginRight: 4,
  },
  value: {
    fontSize: 13,
    color: '#333',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 13, 173, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#6A0DAD',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  shareModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    marginBottom: 20,
  },
  shareModalBody: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  transactionSummary: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainerLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionTypeModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  amountLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coinTextModal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateTextModal: {
    fontSize: 14,
    color: '#888',
  },
  detailsSection: {
    backgroundColor: '#F8F9FD',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: '40%',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    width: '60%',
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6A0DAD',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FD',
    borderRadius: 12,
    marginBottom: 20,
  },
  shareInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  shareOption: {
    alignItems: 'center',
  },
  shareIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    color: '#666',
  },
});