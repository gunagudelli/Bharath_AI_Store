import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useCallback, JSX } from 'react';
// Import the React namespace for JSX.Element type
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios, { AxiosResponse } from 'axios';
import BASE_URL from '../../../config';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import ColoredScrollFlatList from './FlatlistScroll';
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/types";
import { router } from 'expo-router';

const { height, width } = Dimensions.get('window');

interface User {
  accessToken: string;
  userId: string;
}


interface AgentFile {
  fileName: string;
  fileSize: string;
  fileId: string;
  id: string;
}

interface Assistant {
  status: string;
  id: string;
  agentName: string;
  name: string;
  userRole: string;
  language: string;
  agentStatus: string;
  activeStatus: boolean;
  userExperience: number;
  acheivements: string;
  headerTitle: string;
  screenStatus: string;
  description?: string;
  userExperienceSummary?: string;
  instructions?: string;
  created_at: string;
  updatedAt: string;
  assistantId?: string;
  profileImagePath?: string;
}

interface AssistantsData {
  assistants: Assistant[];
}

const AllAgentCreations: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [assistantsData, setAssistantsData] = useState<AssistantsData | null>(null);
  const [filteredData, setFilteredData] = useState<AssistantsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expandedInstructions, setExpandedInstructions] = useState<Record<string, boolean>>({});
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFileUpload, setShowFileUpload] = useState<string | undefined>(undefined);
  const [showImageUpload, setShowImageUpload] = useState<Record<string, boolean>>({});
  const [agentFile, setAgentFile] = useState<Record<string, AgentFile[]>>({});
  const [showAgentFile, setShowAgentFile] = useState<Record<string, boolean>>({});
  const token = useSelector((state: RootState) => state.userData?.accessToken);
  const userId = useSelector((state: RootState) => state.userData?.userId);
  const fetchAssistants = (): void => {
    setLoading(true);
    axios({
      url: `${BASE_URL}ai-service/agent/allAgentDataList?userId=${userId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response: AxiosResponse<AssistantsData>) => {
        setAssistantsData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      })
      .catch((error: any) => {
        console.log('Assistants error', error);
        setLoading(false);
      });
  };

  const getAgentFile = (assistantId: string): void => {
    console.log('getting agent file');
    axios
      .get(`${BASE_URL}ai-service/agent/getUploaded?assistantId=${assistantId}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: AxiosResponse<AgentFile[]>) => {
        console.log(response.data);
        if (response.data.length === 0) {
          console.log('showAgentFile', showAgentFile);
          setShowAgentFile((prev) => ({ ...prev, [assistantId]: false }));
        } else {
          console.log('showAgentFile', showAgentFile);
          setShowAgentFile((prev) => ({ ...prev, [assistantId]: true }));
          setAgentFile((prev) => ({ ...prev, [assistantId]: response.data }));
        }
      })
      .catch((error: any) => {
        console.error(error.response);
      });
  };

  const editAgentStatus = async (agentId: string, newStatus: boolean): Promise<void> => {
    try {
      const response = await axios.patch(
        `${BASE_URL}ai-service/agent/${userId}/${agentId}/hideStatus?activeStatus=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Status updated:', response.data);
      fetchAssistants();
      Alert.alert('Success', 'Agent status updated successfully');
    } catch (error: any) {
      console.error('Error updating agent status:', error.response);
      Alert.alert('Error', 'Failed to update agent status');
    }
  };

  const toggleAgentStatus = (agent: Assistant): void => {
    const newStatus = !agent.activeStatus;
    const statusText = newStatus ? 'activate' : 'deactivate';

    Alert.alert(
      'Confirm Status Change',
      `Are you sure you want to ${statusText} ${agent.agentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => editAgentStatus(agent.id, newStatus),
        },
      ]
    );
  };

  const removeFile = (fileId: string): void => {
    console.log({ fileId });
    axios
      .delete(`${BASE_URL}ai-service/agent/removeFiles?assistantId=${showFileUpload}&fileId=${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: AxiosResponse) => {
        console.log('File removed successfully');
        Alert.alert('Success', 'File removed successfully');
        if (showFileUpload) {
          getAgentFile(showFileUpload);
        }
      })
      .catch((error: any) => {
        // console.error("Error removing file:", error.response);
      });
  };

  const renderAgentFileInfo = ({ item, assistantId }: { item: AgentFile; assistantId: string }): JSX.Element => {
    return (
      <View
        style={[
          styles.fileInfo,
          showAgentFile[assistantId] === true && styles.uploadedFileInfo,
        ]}>
        <View style={styles.fileInfoHeader}>
          <MaterialIcons
            name={showAgentFile[assistantId] === true ? 'check-circle' : 'description'}
            size={20}
            color={showAgentFile[assistantId] === true ? '#28a745' : '#007bff'}
          />
          <Text
            style={[
              styles.fileName,
              showAgentFile[assistantId] === true && styles.uploadedFileName,
            ]}
            numberOfLines={2}>
            {item.fileName}
          </Text>
        </View>

        <Text style={styles.fileInfoText}>Size: {item.fileSize}</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Delete File',
              'Are you sure, you want to delete this file?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    removeFile(item.fileId);
                  },
                },
              ]
            );
          }}
          style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  // Filter assistants based on search query (updated to include agentName)
  const filterAssistants = (query: string): void => {
    if (!assistantsData || !assistantsData.assistants) return;

    if (!query.trim()) {
      setFilteredData(assistantsData);
      return;
    }

    const filteredAssistants = assistantsData.assistants.filter((assistant: Assistant) => {
      const searchLower = query.toLowerCase();
      return (
        (assistant.userRole && assistant.userRole.toLowerCase().includes(searchLower)) ||
        (assistant.name && assistant.name.toLowerCase().includes(searchLower)) ||
        (assistant.agentName && assistant.agentName.toLowerCase().includes(searchLower)) || // Added: Filter by agentName
        (assistant.headerTitle && assistant.headerTitle.toLowerCase().includes(searchLower))
      );
    });

    setFilteredData({
      ...assistantsData,
      assistants: filteredAssistants,
    });
  };

  // Handle search input change
  const handleSearchChange = (text: string): void => {
    setSearchQuery(text);
    filterAssistants(text);
  };

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    fetchAssistants();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAssistants();
    }, [])
  );

  const toggleInstructions = (assistantId: string): void => {
    setExpandedInstructions((prev) => ({
      ...prev,
      [assistantId]: !prev[assistantId],
    }));
  };

  const toggleDescription = (id: string): void => {
    setIsDescriptionExpanded((prev) => !prev);
  };

  const truncateText = (text: string, lines: number = 3): string => {
    if (!text) return '';
    const words = text.split(' ');
    const wordsPerLine = 10; // Approximate words per line
    const maxWords = lines * wordsPerLine;
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string, screenStatus: string, assistantId?: string) => {
    if (screenStatus === 'STAGE4' || assistantId) {
      return {
        text: 'Published',
        style: styles.publishedBadge,
        textStyle: styles.publishedBadgeText,
      };
    } else {
      return {
        text: 'Draft',
        style: styles.draftBadge,
        textStyle: styles.draftBadgeText,
      };
    }
  };

  const renderAssistantCard = ({ item: assistant }: { item: Assistant }): JSX.Element => {
    const statusBadge = getStatusBadge(assistant?.status, assistant.screenStatus, assistant.assistantId);
    const isExpanded = expandedInstructions[assistant.id];
    const agentFiles = agentFile[assistant.assistantId || assistant.id] || [];
    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <ImageUpload
              assistantId={assistant.id}
              name={assistant.agentName}
              profileImage={assistant.profileImagePath}
            />
          </View>
          <View style={styles.headerTop}>
            <View style={styles.avatarContainer}>
              <View style={styles.nameContainer}>
                <Text style={styles.agentName}>{assistant.agentName}</Text>
                <Text style={styles.userName}>{assistant.name}</Text>
              </View>
            </View>
            <View style={statusBadge.style}>
              <Text style={statusBadge.textStyle}>{statusBadge.text}</Text>
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.leftGroup}>
              <Text style={styles.roleText}>👤 {assistant.userRole}</Text>
              <Text style={styles.roleText}>🌐 {assistant.language}</Text>
            </View>
            <TouchableOpacity
              style={styles.updatebtn}
              onPress={() =>
              router.push({
                  pathname: '/(screen)/AgentCreation/agentCreation',
                  params: { agentData: JSON.stringify(assistant) }, // Serialize if object
                })}>
              <Text style={styles.updateText}>
                📝 {assistant.assistantId ? 'Update' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Key Information */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{assistant.agentStatus}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Active:</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: assistant.activeStatus ? '#10B981' : '#EF4444' },
                ]}>
                {assistant.activeStatus ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Experience:</Text>
              <Text style={styles.infoValue}>{assistant.userExperience} years</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Achievements:</Text>
              <Text style={styles.infoValue}>🏆 {assistant.acheivements}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>headerTitle:</Text>
              <Text style={styles.infoValue}>{assistant.headerTitle}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{assistant.screenStatus}</Text>
            </View>
          </View>

          {/* Description */}
          {assistant.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Description</Text>
                <TouchableOpacity
                  onPress={() => toggleDescription(assistant.id)}
                  style={styles.moreButton}>
                  <Text style={styles.moreButtonText}>
                    {isDescriptionExpanded ? 'Show Less' : 'More'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionText}>
                {isDescriptionExpanded
                  ? assistant.description
                  : truncateText(assistant.description, 3)}
              </Text>
            </View>
          )}

          {/* Experience Summary */}
          {assistant.userExperienceSummary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience Summary</Text>
              <Text style={styles.sectionText}>{assistant.userExperienceSummary}</Text>
            </View>
          )}

          {/* Instructions */}
          {assistant.instructions && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📋 Instructions</Text>
                <TouchableOpacity
                  onPress={() => toggleInstructions(assistant.id)}
                  style={styles.moreButton}>
                  <Text style={styles.moreButtonText}>{isExpanded ? 'Show Less' : 'More'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionText}>
                {isExpanded ? assistant.instructions : truncateText(assistant.instructions, 3)}
              </Text>
            </View>
          )}

          {/* Timestamps */}
          <View style={styles.timestampContainer}>
            <View style={styles.timestampRow}>
              <Text style={styles.timestampLabel}>Created:</Text>
              <Text style={styles.timestampValue}>{formatDate(assistant.created_at)}</Text>
            </View>
            <View style={styles.timestampRow}>
              <Text style={styles.timestampLabel}>Updated:</Text>
              <Text style={styles.timestampValue}>{formatDate(assistant.updatedAt)}</Text>
            </View>
          </View>
          {assistant.assistantId && (
            <View style={styles.actionHintContainer}>
              <TouchableOpacity style={styles.actionHint} onPress={() => toggleAgentStatus(assistant)}>
                <Text style={styles.actionText}>
                  Tap to {assistant.activeStatus ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionHint}
                onPress={() => {
                  setShowFileUpload(assistant.assistantId);
                  if (assistant.assistantId) {
                    getAgentFile(assistant.assistantId);
                  }
                }}>
                <Text style={styles.actionText}>File Upload</Text>
              </TouchableOpacity>
            </View>
          )}

          {showAgentFile[assistant.assistantId || ''] && (
            <View style={styles.fileContainer}>
              <ColoredScrollFlatList
                data={agentFile[assistant.assistantId || ''] || []}
                renderItem={(info) =>
                  renderAgentFileInfo({ item: info.item, assistantId: assistant.assistantId || '' })
                }
                keyExtractor={(item: AgentFile) => item.id}
              />
            </View>
          )}

          {showFileUpload === assistant.assistantId && (
            <View style={styles.uploadSection}>
              <View style={styles.uploadSectionHeader}>
                <MaterialIcons name="attach-file" size={18} color="#3b82f6" />
                <Text style={styles.uploadSectionTitle}>File Upload</Text>
              </View>
              <FileUpload assistantId={assistant.assistantId ?? ''} />
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = (): JSX.Element | null => (
    <View style={styles.header}>
      <Text style={styles.headerCount}>
        Total Assistants: {filteredData?.assistants?.length || 0}
      </Text>
    </View>
  );

  const renderSearchBar = (): JSX.Element => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by role, agent name, user name, or title..." // Updated placeholder to include agent name
        placeholderTextColor="#94A3B8"
        value={searchQuery}
        onChangeText={handleSearchChange}
        clearButtonMode="while-editing"
      />
    </View>
  );

  const renderEmpty = (): JSX.Element => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Matching Assistants Found' : 'No Assistants Found'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Try a different search term' : "You haven't created any assistants yet."}
      </Text>
    </View>
  );

  const keyExtractor = (item: Assistant): string => item.id?.toString() || Math.random().toString();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading Assistants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => router.push('/(screen)/AgentCreation/AIRole')}>
        <Text style={{ color: 'white' }}>Create agent</Text>
      </TouchableOpacity>
      {renderSearchBar()}
      <FlatList<Assistant>
        data={filteredData?.assistants || []}
        renderItem={renderAssistantCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={(filteredData?.assistants?.length ?? 0) > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data: ArrayLike<Assistant> | null | undefined, index: number) => ({
          length: 400, // Approximate height of each card
          offset: 400 * index,
          index,
        })}
      />
    </View>
  );
};

export default AllAgentCreations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    marginBottom:60
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  createBtn: {
    padding: 10,
    backgroundColor: '#6366F1',
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    paddingHorizontal: 4,
  },
  headerCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: width * 0.85,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    // justifyContent: "center",
    // alignItems: "center",
    marginBottom: 10,
  },
  avatarImage: {
    width: width * 0.85,
    height: 100,
    borderRadius: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  userName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  publishedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  publishedBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '500',
  },
  draftBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  draftBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: width * 0.4,
  },
  updatebtn: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    width: width * 0.25,
  },
  updateText: {
    color: '#3730A3',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  roleText: {
    fontSize: 14,
    color: '#6B7280',
    width: width * 0.4,
  },
  cardBody: {
    padding: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sectionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  moreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moreButtonText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '500',
  },
  timestampContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timestampLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  timestampValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionHintContainer: {
    flexDirection: 'row',
    // alignSelf:"flex-end",
    justifyContent: 'space-between',
  },
  actionHint: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    width: 150,
    alignSelf: 'flex-end',
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flex: 1,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  uploadSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 8,
  },
  fileInfo: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 12,
    marginVertical: 15,
    width: width * 0.4,
    height: 100,
    // maxWidth: 320,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    marginRight: 15,
    marginTop: 10,
  },
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 15,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  uploadedFileName: {
    color: '#155724',
  },
  uploadedFileInfo: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745',
  },
  fileInfoText: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 2,
  },
  fileContainer: {
    width: width * 0.85,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    bottom: 2,
  },
});