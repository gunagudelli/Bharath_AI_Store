import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios, { AxiosResponse } from 'axios';
import { router } from 'expo-router';
import React, { JSX, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from "react-redux";
import BASE_URL from '../../../config';
import { RootState } from "../../Redux/types";
import { filterAgentsForMode } from '../../../utils/singleAgentMode';
import FileUpload from './FileUpload';
import ColoredScrollFlatList from './FlatlistScroll';
import ImageUpload from './ImageUpload';

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
  const [expandedDescription, setExpandedDescription] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFileUpload, setShowFileUpload] = useState<string | undefined>(undefined);
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
        const filteredAssistants = filterAgentsForMode(response.data.assistants || []);
        const filteredData = { ...response.data, assistants: filteredAssistants };
        setAssistantsData(filteredData);
        setFilteredData(filteredData);
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
      .get(`${BASE_URL}ai-service/agent/getUploaded?assistantId=${assistantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response: AxiosResponse<AgentFile[]>) => {
        console.log(response.data);
        if (response.data.length === 0) {
          setShowAgentFile((prev) => ({ ...prev, [assistantId]: false }));
        } else {
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
        console.error("Error removing file:", error);
      });
  };

  const renderAgentFileInfo = ({ item, assistantId }: { item: AgentFile; assistantId: string }): JSX.Element => {
    return (
      <View style={[
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
              'Are you sure you want to delete this file?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => removeFile(item.fileId),
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
        (assistant.agentName && assistant.agentName.toLowerCase().includes(searchLower)) ||
        (assistant.headerTitle && assistant.headerTitle.toLowerCase().includes(searchLower))
      );
    });

    setFilteredData({
      ...assistantsData,
      assistants: filteredAssistants,
    });
  };

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
    setExpandedDescription((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const truncateText = (text: string, lines: number = 3): string => {
    if (!text) return '';
    const words = text.split(' ');
    const wordsPerLine = 10;
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
    const isDescExpanded = expandedDescription[assistant.id];
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

          {/* Role and Language Row */}
          <View style={styles.rowContainer}>
            <View style={styles.leftGroup}>
              <Text style={styles.roleText}>{assistant.userRole}</Text>
              <Text style={styles.roleText}>{assistant.language}</Text>
            </View>
          </View>

          {/* Use Agent Button - Always Visible */}
          <TouchableOpacity
            style={styles.useAgentBtn}
            onPress={() => {
              router.push({
                pathname: '/userflow/GenOxyChatScreen',
                params: {
                  assistantId: assistant.assistantId,
                  query: "",
                  category: "Assistant",
                  agentName: assistant.agentName || "Assistant",
                  fd: null,
                  agentId: assistant?.id,
                  title: assistant.agentName || "Chat with Agent",
                }
              });
            }}>
            <Text style={styles.useAgentText}>
              Use Agent <Ionicons name="arrow-forward" size={13} color="#3730A3" />
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Key Information */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Status:{' '}
                <Text style={styles.infoValue}>{assistant.agentStatus}</Text>
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Active:{' '}
                <Text
                  style={[
                    styles.infoValue,
                    { color: assistant.activeStatus ? '#10B981' : '#EF4444' },
                  ]}>
                  {assistant.activeStatus ? 'Yes' : 'No'}
                </Text>
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Experience:{' '}
                <Text style={styles.infoValue}>{assistant.userExperience} years</Text>
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Achievements:{' '}
                <Text style={styles.infoValue}>{assistant.acheivements}</Text>
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Header Title:{' '}
                <Text style={styles.infoValue}>{assistant.headerTitle}</Text>
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Stage:{' '}
                <Text style={styles.infoValue}>{assistant.screenStatus}</Text>
              </Text>
            </View>
          </View>

          {/* Description */}
          {assistant.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>
                {isDescExpanded
                  ? assistant.description
                  : truncateText(assistant.description, 3)}
              </Text>
              <TouchableOpacity
                onPress={() => toggleDescription(assistant.id)}
                style={styles.moreButton}>
                <Text style={styles.moreButtonText}>
                  {isDescExpanded ? 'Show Less' : 'View More➔ '}
                </Text>
              </TouchableOpacity>
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
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.sectionText}>
                {isExpanded ? assistant.instructions : truncateText(assistant.instructions, 3)}
              </Text>
              <TouchableOpacity
                onPress={() => toggleInstructions(assistant.id)}
                style={styles.moreButton}>
                <Text style={styles.moreButtonText}>{isExpanded ? '....Show Less' : 'More➔'}</Text>
              </TouchableOpacity>
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
                  {assistant.activeStatus ? 'Deactivate' : 'Activate'}
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
        placeholder="Search by role, agent name, user name, or title..."
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

  const renderFooter = (): JSX.Element | null => {
    if (!filteredData?.assistants || filteredData.assistants.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.footerContainer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>
          You've reached the end • {filteredData.assistants.length} agent{filteredData.assistants.length !== 1 ? 's' : ''} total
        </Text>
      </View>
    );
  };

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
        onPress={() => router.push('/(screen)/NewAgentCreation/AgentCreationScreen')}>
        <Text style={styles.createBtnText}>Create Agent</Text>
      </TouchableOpacity>
      {renderSearchBar()}
      <FlatList<Assistant>
        data={filteredData?.assistants || []}
        renderItem={renderAssistantCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={(filteredData?.assistants?.length ?? 0) > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
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
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default AllAgentCreations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flatListContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
    flexGrow: 1,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  searchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  createBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366F1',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  createBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  headerCount: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: width * 0.88,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    marginBottom: 10,
  },
  nameContainer: {
    flex: 1,
  },
  agentName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  userName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  publishedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '600',
  },
  draftBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  draftBadgeText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '600',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  roleText: {
    fontSize: 12,
    color: '#6B7280',
  },
  updateBtn: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 90,
  },
  updateText: {
    color: '#3730A3',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  useAgentBtn: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-end',
    minWidth: 110,
  },
  useAgentText: {
    color: '#3730A3',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardBody: {
    padding: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    width: '50%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  sectionText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  moreButton: {
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  moreButtonText: {
    color: '#204593ff',
    fontSize: 12,
    fontWeight: '500',
  },
  timestampContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timestampLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  timestampValue: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height * 0.25,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  footerDivider: {
    height: 1,
    width: '60%',
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  actionHintContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionHint: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  uploadSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  uploadSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 6,
  },
  fileInfo: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    width: width * 0.42,
    minHeight: 90,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
    marginRight: 10,
  },
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 6,
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
    fontSize: 12,
    color: '#6c757d',
    marginVertical: 2,
  },
  fileContainer: {
    width: width * 0.88,
    minHeight: 90,
    borderRadius: 8,
    marginTop: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});