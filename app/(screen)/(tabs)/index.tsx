import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import BASE_URL from "../../../config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AIRoleImage from "../AgentCreation/AIRoleImage";
// import CustomFAB from "./CustomFAB"; // Import the new component
import { router } from "expo-router";
const { width } = Dimensions.get("window");

interface AgentItem {
  id?: string;
  assistantId?: string;
  agentId?: string;
  name?: string;
  description?: string;
  instructions?: string;
  status?: string;
  price?: string;
  rating?: number;
  imageUrl?: string;
  image?: string;
  model?: string;
  assistant?: AgentItem;
}

interface ApiResponse {
  data: AgentItem[];
  lastId: string | null;
  totalCount?: number;
}

const IMAGE_MAP: Record<string, string> = {
  code: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  finance:
    "https://media.licdn.com/dms/image/v2/D4D12AQH9ZTLfemnJgA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1730530043865?e=2147483647&v=beta&t=3GgdQbowwhu3jbuft6-XG2_jPZUSLa0XiCRgSz6AqBg",
  business:
    "https://media.istockphoto.com/id/1480239160/photo/an-analyst-uses-a-computer-and-dashboard-for-data-business-analysis-and-data-management.jpg?s=612x612&w=0&k=20&c=Zng3q0-BD8rEl0r6ZYZY0fbt2AWO9q_gC8lSrwCIgdk=",
  technology: "https://www.bluefin.com/wp-content/uploads/2020/08/ai-future.jpg",
  og: "https://i.ibb.co/gZjkJyQ8/1a.png",
  irdai:
    "https://www.livemint.com/lm-img/img/2024/05/30/600x338/Irdai_health_insurance_1717036677791_1717036677946.png",
  gst: "https://zetran.com/wp-content/uploads/2025/02/GST-Compliance-and-Fraud-Detection-using-AI.jpg",
  law: "https://royalsociety.org/-/media/events/2025/9/ai-and-the-law/ai-and-the-law-image.jpg",
};

const DEFAULT_IMAGE: string[] = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQjSgjdQbvnhDH7go4ETwAOEu05VpFIAOVg&s",
  "https://www.bluefin.com/wp-content/uploads/2020/08/ai-future.jpg",
];

const CUSTOM_AGENTS: AgentItem[] = [
  // {
  //   id: "custom-1",
  //   name: "THE FAN OF OG",
  //   description: "Create Your OG IMAGE. Just Upload Your Photo",
  //   instructions: "Create Your OG IMAGE. Just Upload Your Photo",
  //   status: "APPROVED",
  //   price: "Free",
  //   rating: 5,
  //   image: "https://i.ibb.co/h1fpCXzw/fanofog.png", // optional
  // },
];

const BharathAgentstore: React.FC = () => {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const navigation = useNavigation();

  // Fetch agents
  const getAgents = async (afterId: string | null = null, append: boolean = false): Promise<void> => {
    console.log("Fetching agents, afterId:", afterId, "append:", append);

    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let url = `${BASE_URL}ai-service/agent/getAllAssistants?limit=40`;
      console.log("Fetch URL:", url);

      if (afterId) {
        url += `&after=${afterId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization:
            "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI4ZjI5MjJkMS0yNmZjLTRlY2ItYWE4ZC00OWM1YjQ4ZDk3NDQiLCJpYXQiOjE3NTM1MjU0MzUsImV4cCI6MTc1NDM4OTQzNX0.TsIcuOPETQVFavDWoqK8Mo_fxbzOHSu_0AM_KfR79RtA0O3bCJ0E2jLpeT0jjTbEvQ4Ub4hapU3-EdxZycNgig",
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result: ApiResponse = await response.json();

      if (result?.data && Array.isArray(result.data)) {
        const approvedAgents: AgentItem[] = result.data.filter(
          (agent: AgentItem) => agent.status === "APPROVED"
        );
        let agentsWithCustom: AgentItem[];
        // ✅ Always prepend custom agents
        if (!lastId) {
          agentsWithCustom = [...CUSTOM_AGENTS, ...approvedAgents];
        } else {
          agentsWithCustom = [...approvedAgents];
        }

        const nextCursor: string | null = result.lastId || null;

        if (append) {
          setAgents((prev: AgentItem[]) => [...prev, ...agentsWithCustom]);
        } else {
          setAgents(agentsWithCustom);
        }

        setLastId(nextCursor);
        if (result.totalCount !== undefined) setTotalCount(result.totalCount);

        console.log("Approved agents + custom loaded:", agentsWithCustom.length);
      } else {
        console.log("No data received or invalid format");
        if (!append) setAgents([]);
      }
    } catch (error) {
      console.error("Fetch agents error:", error);
      Alert.alert("Error", "Failed to load assistants.");
      if (!afterId) setAgents([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // 🔹 Helper function
  const getAgentImage = (name: string | undefined): string => {
    if (!name) {
      return DEFAULT_IMAGE[Math.floor(Math.random() * DEFAULT_IMAGE.length)];
    }

    const lowerName = name.toLowerCase();

    // Special case: OG Fan Story Predictor
    if (lowerName.includes("og")) {
      return IMAGE_MAP.og;
    }

    // Check for keywords in name
    for (const key in IMAGE_MAP) {
      if (lowerName.includes(key)) {
        return IMAGE_MAP[key as keyof typeof IMAGE_MAP];
      }
    }

    // Fallback random image
    return DEFAULT_IMAGE[Math.floor(Math.random() * DEFAULT_IMAGE.length)];
  };

  // Fixed: Use useFocusEffect properly
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, loading agents...");
      getAgents(null, false);
    }, [])
  );

  // Fixed: Ensure filtered agents update correctly
  useEffect(() => {
    console.log("Filtering agents, total:", agents.length);
    const filtered: AgentItem[] = agents.filter((agent: AgentItem) => {
      const a: AgentItem = agent.assistant || agent;
      const text: string =
        `${a.name} ${a.instructions} ${a.description} ${a.model}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
    setFilteredAgents(filtered);
    console.log("Filtered agents:", filtered.length);
  }, [agents, search]);

  const onRefresh = (): void => {
    setRefreshing(true);
    setLastId(null);
    setSearch("");
    getAgents(null, false);
  };

  const loadMore = (): void => {
    if (lastId && !loadingMore) {
      getAgents(lastId, true);
    }
  };

  const goToChat = (agent: AgentItem): void => {
    const assistant: AgentItem = agent.assistant || agent;
    const assistantId: string | undefined = assistant.id || assistant.assistantId;

    if (!assistantId) {
      Alert.alert("Error", "Assistant ID not found.");
      return;
    }

    if (assistant.name === "THE FAN OF OG") {
      // navigation.navigate("Image Creator", {
      //   assistantId,
      //   query: "",
      //   category: "Fan of OG",
      //   agentName: "Fan of OG",
      //   fd: null,
      //   agentId: assistant.agentId,
      // });
       router.push({
        pathname: '/(auth)/otp',
        params: { assistantId: assistantId, query: "", category: "Fan of OG",
        agentName: "Fan of OG",
        fd: null,
        agentId: assistant.agentId},
      });
      return;
    } else {
      // navigation.navigate("GenOxyChatScreen", {
      //   assistantId,
      //   query: "",
      //   category: "Assistant",
      //   agentName: assistant.name || "Assistant",
      //   fd: null,
      //   agentId: assistant.agentId,
      // });
      router.push({
        pathname: '/userflow/GenOxyChatScreen',
        params: { 
        assistantId: assistantId,
         query: "", 
         category: "Assistant",
        agentName: assistant.name || "Assistant",
        fd: null,
        agentId: assistant.agentId,
        title: assistant.name || "Chat with Agent",
      }
      });
    }
  };

  // Truncate description
  const getPreview = (text: string | undefined): string => {
    if (!text) return "No description available";
    const clean: string = text.replace(
      /You are the dedicated .*? AI Assistant\.\s*/,
      ""
    );
    return clean.length > 120 ? clean.substring(0, 117) + "..." : clean;
  };

  const renderAgentCard = ({ item }: { item: AgentItem }): React.ReactElement => {
    const agent: AgentItem = item.assistant || item;
    const price: string = agent.price || "Free";
    const rating: number = agent.rating || 5;
    const isGridMode: boolean = viewMode === "grid";

    const agentImage: string = agent.imageUrl || getAgentImage(agent.name);

    return (
      <TouchableOpacity
        style={[
          styles.agentCard,
          isGridMode ? styles.gridCard : styles.listCard,
        ]}
        onPress={() => goToChat(agent)}
        activeOpacity={0.8}
      >
        {/* 🔹 Agent Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: agentImage }}
            style={[isGridMode ? styles.agentImage : styles.listImage]}
            resizeMode="cover"
          />
        </View>

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerInfo}>
            <Text style={styles.agentName} numberOfLines={2}>
              {agent.name || "Unnamed Assistant"}
            </Text>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor("active") },
                ]}
              >
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
              <Text style={styles.price}>
                {price === "Free" ? "Free" : `₹${price}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.agentPreview} numberOfLines={isGridMode ? 2 : 3}>
          {getPreview(agent.instructions || agent.description)}
        </Text>

        {/* Rating & Button */}
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i: number) => (
              <Text
                key={i}
                style={[styles.star, i < rating ? styles.filledStar : {}]}
              >
                ★
              </Text>
            ))}
            <Text style={styles.ratingText}>({rating}.0)</Text>
          </View>

          <TouchableOpacity
            style={styles.useButton}
            onPress={() => goToChat(agent)}
          >
            <Text style={styles.useButtonText}>Use Agent</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Corner Accent */}
        <View style={styles.cornerAccent} />
      </TouchableOpacity>
    );
  };

  // Helper functions for dynamic styling
  const getAvatarColor = (name: string | undefined): string => {
    const colors: string[] = [
      "#8B5CF6",
      "#EC4899",
      "#10B981",
      "#F59E0B",
      "#3B82F6",
      "#EF4444",
      "#8B5A2B",
    ];
    const index: number = typeof name === "string" && name.length > 0
      ? name.charCodeAt(0) % colors.length
      : 0;
    return colors[index];
  };

  const getStatusColor = (status: string): string => {
    return status === "active" ? "#10B981" : "#64748B";
  };

  const shouldShowLoadMore: boolean = !!lastId && agents.length > 0;

  const renderEmpty = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>🤖</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {search ? "No matches found" : "No assistants available"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {search
          ? "Try adjusting your search terms"
          : "Check back later for new assistants"}
      </Text>
      {!loading && !search && (
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = (): React.ReactElement => (
    <View style={styles.headerContainer}>
      {/* Enhanced Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search AI assistants..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/register")}
      >
        <AIRoleImage />
      </TouchableOpacity>

      {/* Stats & View Toggle */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredAgents.length} assistant
          {filteredAgents.length !== 1 ? "s" : ""} available
        </Text>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "list" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Text
              style={[
                styles.toggleIcon,
                viewMode === "list" && styles.toggleIconActive,
              ]}
            >
              ☰
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "grid" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Text
              style={[
                styles.toggleIcon,
                viewMode === "grid" && styles.toggleIconActive,
              ]}
            >
              ⊞
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Improved loading screen
  if (loading && !refreshing && agents.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
        <Text style={styles.loadingText}>Discovering AI assistants...</Text>
        <Text style={styles.loadingSubtext}>This might take a moment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      {renderHeader()}

      {/* Enhanced Grid/List */}
      <View style={styles.contentContainer}>
        <FlatList<AgentItem>
          data={filteredAgents}
          renderItem={renderAgentCard}
          keyExtractor={(item: AgentItem) =>
            item.id || item.assistantId || "key-" + Math.random()
          }
          numColumns={viewMode === "grid" ? 2 : 1}
          key={`${viewMode}-${viewMode === "grid" ? 2 : 1}`}
          contentContainerStyle={[
            styles.listContainer,
            viewMode === "grid" && styles.gridContainer,
          ]}
          columnWrapperStyle={viewMode === "grid" && styles.gridWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
          ListEmptyComponent={renderEmpty}
          initialNumToRender={10}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
        />
      </View>

      {/* Enhanced Load More Button */}
      {shouldShowLoadMore && (
        <View style={styles.loadMoreContainer}>
          <TouchableOpacity
            style={[
              styles.loadMoreButton,
              loadingMore && styles.loadMoreButtonDisabled,
            ]}
            onPress={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.loadMoreButtonText}>
                  Load More Assistants
                </Text>
                <Text style={styles.loadMoreIcon}>↓</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Reusable FAB Component */}
      {/* <CustomFAB navigation={navigation} /> */}
    </View>
  );
};

export default BharathAgentstore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    height: "100%",
  },
  clearIcon: {
    fontSize: 14,
    color: "#64748B",
    padding: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleIcon: {
    fontSize: 16,
    color: "#64748B",
  },
  toggleIconActive: {
    color: "#8B5CF6",
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  gridWrapper: {
    justifyContent: "space-between",
  },
  agentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    overflow: "hidden",
    width: "48%",
  },
  listCard: {
    marginHorizontal: 4,
    width: "100%",
  },
  gridCard: {
    flex: 0,
    marginHorizontal: 4,
    maxWidth: (width - 32) / 2 - 8,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  agentImage: {
    width: "100%",
    height: 120,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listImage: {
    width: "100%",
    height: 240,
  },
  initialContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  initialText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    marginRight: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  price: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  agentPreview: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    fontSize: 12,
    color: "#D1D5DB",
    marginRight: 2,
  },
  filledStar: {
    color: "#FBBF24",
  },
  ratingText: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: 4,
  },
  useButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 1,
  },
  useButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginRight: 4,
  },
  arrowIcon: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  cornerAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    backgroundColor: "#8B5CF6",
    opacity: 0.1,
    borderBottomLeftRadius: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
    marginBottom: 6,
  },
  loadingSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#F8FAFC",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 18,
  },
  retryButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 1,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  loadMoreContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  loadMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  loadMoreIcon: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});