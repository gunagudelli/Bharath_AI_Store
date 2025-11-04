import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import BASE_URL, { userStage } from '../../../config';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RootState } from '../../Redux/types';
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');

interface UserData {
  accessToken: string;
  userId: string;
}

interface Ticket {
  id: string;
  randomTicketId: string;
  query: string;
  createdAt: string;
  comments?: string;
  resolvedOn?: string;
  userQueryDocumentStatus?: {
    adminUploadedFilePath?: string;
  };
}

interface CancelTicketData {
  adminDocumentId: string;
  comments: string;
  email: string;
  id: string;
  mobileNumber: string;
  projectType: string;
  query: string;
  queryStatus: string;
  resolvedBy: string;
  resolvedOn: string;
  status: string;
  userDocumentId: string;
  userId: string;
}

interface TicketHistoryProps {
  navigation: NavigationProp<any>;
}

const TicketHistory: React.FC<TicketHistoryProps> = ({ navigation }) => {
  const [queryStatus, setQueryStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState<string | undefined>(undefined);
  const userData = useSelector((state: RootState) => state.userData);
  const token: string | undefined = userData?.accessToken;
  const customerId: string | undefined = userData?.userId;
  const [removeModal, setRemoveModal] = useState<boolean>(false);
  const [comments, setComments] = useState<string>('');
  const [comments_error, setComments_error] = useState<boolean>(false);
  const [yesLoader, setYesLoader] = useState<boolean>(false);

  useEffect(() => {
    fetchTickets();
  }, [queryStatus]);

  const fetchTickets = (): void => {
    setLoading(true);
    axios
      .post(
        BASE_URL + `user-service/write/getAllQueries`,
        {
          queryStatus,
          userId: customerId,
          askOxyOfers: 'FREESAMPLE',
          projectType: 'ASKOXY',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response: AxiosResponse) => {
        console.log('getQueries', response.data);
        setTickets(response.data || []);
        setLoading(false);
      })
      .catch((error: any) => {
        console.log(error.response);
        setLoading(false);
      });
  };

  const data = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const cancelTicket = (ticketId: string, query: string): void => {
    setTicketId(ticketId);
    setQuery(query);
    setRemoveModal(true);
  };

  const cancelTicketConfirm = (ticketId: string, query: string): void => {
    if (comments === '' || comments === null) {
      setComments_error(true);
      return;
    }
    const data: CancelTicketData = {
      adminDocumentId: '',
      comments,
      email: '',
      id: ticketId,
      mobileNumber: '',
      projectType: 'OXYRICE',
      query,
      queryStatus: 'CANCELLED',
      resolvedBy: 'customer',
      resolvedOn: '',
      status: '',
      userDocumentId: '',
      userId: customerId || '',
    };

    setYesLoader(true);
    axios
      .post(BASE_URL + 'user-service/write/saveData', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: AxiosResponse) => {
        setComments('');
        setRemoveModal(false);
        fetchTickets();
        setYesLoader(false);
      })
      .catch((error: any) => {
        console.log(error.response);
        setYesLoader(false);
      });
  };

  const openFile = (url: string): void => {
    const fileExtension = url.split('.').pop()?.toLowerCase();
    if (['jpeg', 'jpg', 'png'].includes(fileExtension || '')) {
      setModalVisible(true);
      setFileUrl(url);
    } else if (fileExtension === 'pdf') {
      // Handle PDF
    } else {
      Alert.alert('Unsupported file format.');
    }
  };

  const getStatusColor = () => {
    switch (queryStatus) {
      case 'PENDING':
        return ['#FF9800', '#FB8C00'];
      case 'COMPLETED':
        return ['#4CAF50', '#45a049'];
      case 'CANCELLED':
        return ['#F44336', '#E53935'];
      default:
        return ['#2196F3', '#1976D2'];
    }
  };

  const getStatusIcon = () => {
    switch (queryStatus) {
      case 'PENDING':
        return 'time-outline';
      case 'COMPLETED':
        return 'checkmark-circle-outline';
      case 'CANCELLED':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      {/* <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Ticket History</Text>
        <Text style={styles.headerSubtitle}>Manage and track your support tickets</Text>
      </View> */}

      {/* Filter Dropdown */}
      <View style={styles.filterContainer}>
        <Ionicons name="filter" size={20} color="#666" style={styles.filterIcon} />
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          data={data}
          labelField="label"
          valueField="value"
          value={queryStatus}
          onChange={(item: { label: string; value: string }) => {
            setQueryStatus(item.value as 'PENDING' | 'COMPLETED' | 'CANCELLED');
            setTickets([]);
          }}
          renderLeftIcon={() => (
            <Ionicons 
              name={getStatusIcon()} 
              size={18} 
              color={getStatusColor()[0]} 
              style={{ marginRight: 8 }}
            />
          )}
        />
      </View>

      {/* Content Section */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      ) : tickets && tickets.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={tickets}
          keyExtractor={(item: Ticket) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }: { item: Ticket }) => (
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.ticketIdContainer}>
                  <Ionicons name="ticket-outline" size={18} color="#4CAF50" />
                  <Text style={styles.ticketId}>#{item.randomTicketId}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor()[0] }]}>
                  <Text style={styles.statusText}>{queryStatus}</Text>
                </View>
              </View>

              {/* Query Section */}
              <View style={styles.querySection}>
                <Text style={styles.queryLabel}>Query</Text>
                <Text style={styles.queryText}>{item.query}</Text>
              </View>

              {/* Info Grid */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Created</Text>
                    <Text style={styles.infoValue}>{item?.createdAt?.substring(0, 10)}</Text>
                  </View>
                </View>

                {queryStatus === 'CANCELLED' && item.resolvedOn && (
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-done-outline" size={16} color="#666" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Resolved</Text>
                      <Text style={styles.infoValue}>{item?.resolvedOn?.substring(0, 10)}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Comments Section */}
              {(queryStatus === 'COMPLETED' || queryStatus === 'CANCELLED') && item.comments && (
                <View style={styles.commentsSection}>
                  <View style={styles.commentHeader}>
                    <Ionicons name="chatbox-ellipses-outline" size={16} color="#2196F3" />
                    <Text style={styles.commentLabel}>
                      {queryStatus === 'CANCELLED' ? 'Cancellation Reason' : 'Admin Comments'}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{item.comments}</Text>
                </View>
              )}

              {/* File Attachment */}
              {item.userQueryDocumentStatus?.adminUploadedFilePath && (
                <TouchableOpacity
                  style={styles.fileAttachment}
                  onPress={() => openFile(item.userQueryDocumentStatus?.adminUploadedFilePath || '')}
                >
                  <Ionicons name="document-attach-outline" size={20} color="#2196F3" />
                  <Text style={styles.fileText} numberOfLines={1}>View Attachment</Text>
                  <Ionicons name="chevron-forward" size={18} color="#2196F3" />
                </TouchableOpacity>
              )}

              {/* Action Buttons */}
              <View style={styles.actionContainer}>
                {queryStatus === 'PENDING' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.replyButton]}
                      onPress={() => {
                        navigation.navigate('Write To Us', {
                          ticketId: item.id,
                          query: item.query,
                        });
                      }}
                    >
                      <Ionicons name="create-outline" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Reply</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => cancelTicket(item.id, item.query)}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.commentsButton]}
                  onPress={() => {
                    navigation.navigate('View Comments', { details: item });
                  }}
                >
                  <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>View Comments</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Tickets Found</Text>
          <Text style={styles.emptySubtitle}>
            You don't have any {queryStatus.toLowerCase()} tickets at the moment
          </Text>
        </View>
      )}

      {/* Image Preview Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imageModalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>
            <Image source={{ uri: fileUrl }} style={styles.previewImage} resizeMode="contain" />
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={removeModal}
        onRequestClose={() => setRemoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning-outline" size={48} color="#FF9800" />
              <Text style={styles.modalTitle}>Cancel Ticket</Text>
            </View>

            <Text style={styles.modalDescription}>
              Are you sure you want to cancel this ticket? Please provide a reason below.
            </Text>

            <TextInput
              style={[styles.input, comments_error && styles.inputError]}
              placeholder="Enter reason for cancellation..."
              placeholderTextColor="#999"
              value={comments}
              numberOfLines={4}
              multiline
              textAlignVertical="top"
              onChangeText={(text: string) => {
                setComments(text);
                setComments_error(false);
              }}
            />
            {comments_error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#F44336" />
                <Text style={styles.errorText}>Reason is required</Text>
              </View>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalNoButton]}
                onPress={() => {
                  setRemoveModal(false);
                  setComments('');
                }}
              >
                <Text style={styles.modalButtonText}>No, Keep It</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalYesButton]}
                onPress={() => cancelTicketConfirm(ticketId || '', query || '')}
                disabled={yesLoader}
              >
                {yesLoader ? (
                  <ActivityIndicator size={20} color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TicketHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  filterIcon: {
    marginRight: 10,
  },
  dropdown: {
    flex: 1,
    height: 50,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#999',
  },
  dropdownSelectedText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  querySection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  queryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  queryText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  infoTextContainer: {
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  commentsSection: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  commentText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  fileText: {
    flex: 1,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    flex: 1,
  },
  replyButton: {
    backgroundColor: '#FF9800',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  commentsButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: width * 0.9,
    height: height * 0.7,
    backgroundColor: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cancelModalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#F8F9FA',
    minHeight: 100,
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorText: {
    color: '#F44336',
    fontSize: 13,
    marginLeft: 6,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNoButton: {
    backgroundColor: '#E0E0E0',
  },
  modalYesButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});