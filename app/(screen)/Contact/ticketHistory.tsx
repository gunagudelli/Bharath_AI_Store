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
import { RootState } from '../../Redux/types'; // Adjust path to your Redux types

const { height, width } = Dimensions.get('window');

// Interface for user data from Redux
interface UserData {
  accessToken: string;
  userId: string;
  // Add other fields as needed
}

// Interface for ticket item
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

// Interface for comments data in cancel
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

// Props interface
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
    console.log({ query });
    setRemoveModal(true);
    console.log('Cancelled id and query:', ticketId, query);
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

    console.log(data);
    setYesLoader(true);
    axios
      .post(BASE_URL + 'user-service/write/saveData', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: AxiosResponse) => {
        console.log('Sravani', response.data);
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
    console.log(url);

    if (['jpeg', 'jpg', 'png'].includes(fileExtension || '')) {
      setModalVisible(true);
      setFileUrl(url);
    } else if (fileExtension === 'pdf') {
      // Assuming Linking is imported, but it's not in the code - add if needed
      // Linking.openURL(filePath); // filePath not defined, adjust as needed
    } else {
      Alert.alert('Unsupported file format.');
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Ticket History</Text> */}
      <Dropdown
        style={styles.dropdown}
        data={data}
        labelField="label"
        valueField="value"
        // placeholder="Select status"
        value={queryStatus}
        onChange={(item: { label: string; value: string }) => {
          setQueryStatus(item.value as 'PENDING' | 'COMPLETED' | 'CANCELLED');
          fetchTickets();
          setTickets([]);
        }}
      />

      {!loading ? (
        <>
          {tickets && tickets.length > 0 ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={tickets}
              keyExtractor={(item: Ticket) => item.id.toString()}
              renderItem={({ item }: { item: Ticket }) => (
                <View style={styles.card}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Ticket Id</Text>
                    <Text style={styles.value}>{item.randomTicketId}</Text>
                  </View>

                  <View style={styles.row}>
                    <View>
                      <Text style={styles.label}>Query </Text>
                    </View>

                    <View>
                      <Text style={styles.value}>{item.query}</Text>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View>
                      <Text style={styles.label}>Created On</Text>
                    </View>
                    <View>
                      <Text style={styles.value}>
                        {item?.createdAt?.substring(0, 10)}
                      </Text>
                    </View>
                  </View>

                  {queryStatus === 'COMPLETED' ? (
                    <>
                      <View style={styles.row}>
                        <View>
                          <Text style={styles.label}>Admin Comments</Text>
                        </View>
                        <View>
                          <Text style={styles.value}>{item?.comments}</Text>
                        </View>
                      </View>

                      {/* {item.userQueryDocumentStatus?.adminUploadedFilePath != null ? (
                    <View style={styles.row}>
                      <Text style={styles.label}>File</Text>
                      <TouchableOpacity
                        onPress={() =>
                          openFile(item.userQueryDocumentStatus?.adminUploadedFilePath)
                        }
                      >
                        <Text style={styles.value1}>
                          {item.userQueryDocumentStatus?.adminUploadedFilePath}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null} */}
                    </>
                  ) : null}

                  {queryStatus === 'CANCELLED' ? (
                    <>
                      <View style={styles.row1}>
                        <View>
                          <Text style={styles.label}>Reason </Text>
                        </View>
                        <View>
                          <Text style={styles.value}>{item.comments}</Text>
                        </View>
                      </View>

                      <View style={styles.row1}>
                        <View>
                          <Text style={styles.label}>Resolved</Text>
                        </View>
                        <View>
                          <Text style={styles.value}>
                            {item?.resolvedOn?.substring(0, 10)}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : null}

                  {item.userQueryDocumentStatus?.adminUploadedFilePath != null ? (
                    <View style={styles.row}>
                      <Text style={styles.label}>File</Text>
                      <TouchableOpacity
                        onPress={() =>
                          openFile(item.userQueryDocumentStatus?.adminUploadedFilePath || '')
                        }
                      >
                        <Text style={styles.value1}>
                          {item.userQueryDocumentStatus?.adminUploadedFilePath}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <View style={styles.row1}>
                    {queryStatus === 'PENDING' ? (
                      <>
                        <TouchableOpacity
                          style={styles.replybtn}
                          onPress={() => {
                            navigation.navigate('Write To Us', {
                              ticketId: item.id,
                              query: item.query,
                            });
                          }}
                        >
                          <Text>Write a reply</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelbtn}
                          onPress={() => cancelTicket(item.id, item.query)}
                        >
                          <Text style={{ color: 'white' }}>Cancel</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.commentsbtn}>
                      <Text style={{ color: "white" }}>View Comments</Text>
                    </TouchableOpacity> */}
                      </>
                    ) : null}
                    <TouchableOpacity
                      style={styles.commentsbtn}
                      onPress={() => {
                        navigation.navigate('View Comments', { details: item });
                      }}
                    >
                      <Text style={{ color: 'white' }}>View Comments</Text>
                    </TouchableOpacity>

                    {queryStatus === 'COMPLETED' || queryStatus === 'CANCELLED' ? (
                      <>
                        {/* <TouchableOpacity style={styles.cancelbtn}>
                          <Text style={{ color: "white" }}>Inquires Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.commentsbtn}>
                      <Text style={{ color: "white" }}>View Comments</Text>
                    </TouchableOpacity> */}
                      </>
                    ) : null}
                  </View>
                </View>
              )}
              // ListEmptyComponent={<Text style={styles.emptyText}>No tickets available.</Text>}
            />
          ) : (
            <Text style={styles.emptyText}>No tickets available</Text>
          )}
        </>
      ) : (
        <ActivityIndicator size={30} color="green" />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>
            {/* <Text>dcngf</Text> */}
            <Image source={{ uri: fileUrl }} style={styles.qrImage} />
          </View>
        </View>
      </Modal>

      {removeModal ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={removeModal}
          onRequestClose={() => setRemoveModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Optional Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setRemoveModal(false);
                  setComments('');
                }}
              >
                <Text style={{ fontSize: 20, color: 'black' }}>X</Text>
              </TouchableOpacity>
              {/* <Text>{ticketId} , {query}</Text> */}
              {/* Confirmation Text */}
              <Text style={styles.confirmText}>
                Are you sure you want to cancel the query?
                {/* ${ticketId} */}
              </Text>

              {/* Comment Input */}
              <TextInput
                style={styles.input}
                placeholder="Reason to cancel"
                value={comments}
                numberOfLines={5}
                multiline
                onChangeText={(text: string) => {
                  setComments(text);
                  setComments_error(false);
                }}
              />
              {comments_error === true ? (
                <Text style={{ color: 'red', margin: 5 }}>Reason is mandatory</Text>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.submitbtn1}
                  onPress={() => {
                    setRemoveModal(false);
                    setComments('');
                  }}
                >
                  <Text style={{ color: 'white' }}>No</Text>
                </TouchableOpacity>

                {yesLoader === false ? (
                  <TouchableOpacity
                    style={styles.submitbtn}
                    onPress={() => cancelTicketConfirm(ticketId || '', query || '')}
                  >
                    <Text style={{ color: 'white' }}>yes</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.submitbtn}>
                    <ActivityIndicator size={20} color="white" />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

export default TicketHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
    backgroundColor: 'white',
    padding: 10,
    width: '50%',
    alignSelf: 'flex-end',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFF',
    // padding: 5,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 8,

    // bottomBorderColor: "black",
    // borderBottomWidth: 0.5,
    // margin: 5,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginBottom: 8,
    // bottomBorderColor: "black",
    // borderBottomWidth: 0.5,
    margin: 8,
  },
  value1: {
    width: width * 0.4,
    color: '#074799',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    width: width * 0.25,
    // alignSelf:"flex-start"
  },
  label1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  submitbtn: {
    backgroundColor: 'green',
    alignSelf: 'center',
    padding: 8,
    width: 100,
    alignItems: 'center',
    borderRadius: 10,
  },
  submitbtn1: {
    backgroundColor: 'red',
    alignSelf: 'center',
    padding: 8,
    width: 100,
    alignItems: 'center',
    borderRadius: 10,
  },

  value: {
    fontSize: 16,
    color: '#555',
    alignItems: 'flex-end',
    marginLeft: 15,
    width: width * 0.4,
    justifyContent: 'flex-end',
  },
  emptyText: {
    // flex:1,
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
  },
  replybtn: {
    backgroundColor: 'orange',
    padding: 10,
    margin: 10,
  },
  cancelbtn: {
    backgroundColor: 'red',
    padding: 10,
    margin: 10,
  },
  commentsbtn: {
    backgroundColor: '#0384d5',
    padding: 10,
    margin: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // height:"auto"
    // height:height*0.7
  },
  modalContent: {
    width: width * 0.8,
    height: 350,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  qrImage: {
    width: 250,
    height: 250,
    // resizeMode: "contain",
  },
  confirmText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    width: '100%',

    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});