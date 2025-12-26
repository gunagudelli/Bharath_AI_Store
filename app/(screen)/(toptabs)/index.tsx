import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  Linking, // Added for opening web URLs
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import BASE_URL, { APK_BASE_URL } from "../../../config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AIRoleImage from "../AgentCreation/AIRoleImage";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import APKBuildStatus from "../../../components/APKBuildStatus";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  url?: string; // Added for web search results
  isWeb?: boolean; // Flag for web search results
}

interface ApiResponse {
  data: AgentItem[];
  lastId: string | null;
  totalCount?: number;
}

const WEB_IMAGE = "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=🔍+Web"; // Placeholder for web results

const CUSTOM_AGENTS: AgentItem[] = [
  // {
  // id: "custom-1",
  // name: "THE FAN OF OG",
  // description: "Create Your OG IMAGE. Just Upload Your Photo",
  // instructions: "Create Your OG IMAGE. Just Upload Your Photo",
  // status: "APPROVED",
  // price: "Free",
  // rating: 5,
  // image: "https://i.ibb.co/h1fpCXzw/fanofog.png", // optional
  // },
];

const BharathAgentstore: React.FC = () => {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [localAgents, setLocalAgents] = useState<AgentItem[]>([]); // Renamed for clarity: local filtered agents
  const [searchResults, setSearchResults] = useState<AgentItem[]>([]); // New: web search results
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false); // New: for web search loading
  const [lastId, setLastId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigation = useNavigation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // New: for debouncing search API calls
  
  // 🔥 APK Generation States
  const [generatingApk, setGeneratingApk] = useState<{[key: string]: boolean}>({});
  const [buildProgress, setBuildProgress] = useState<{[key: string]: {step: number, message: string, progress: number}}>({});
  const [showBuildStatus, setShowBuildStatus] = useState(false);
  const [currentBuildId, setCurrentBuildId] = useState<string>("");
  const [currentAgentName, setCurrentAgentName] = useState<string>("");
  const [activeBuildsByAgent, setActiveBuildsByAgent] = useState<{[key: string]: string}>({});
  
  // 🔒 Get user data from Redux
  const userData = useSelector((state: any) => state.userData);

  // Fetch agents (unchanged)
  const getAgents = async (afterId: string | null = null, append: boolean = false): Promise<void> => {
    // console.log("Fetching agents, afterId:", afterId, "append:", append);
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      let url = `${BASE_URL}ai-service/agent/getAllAssistants?limit=40`;
      // console.log("Fetch URL:", url);
      if (afterId) {
        url += `&after=${afterId}`;
      }
      const response = await axios.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: userData?.accessToken || "",
        },
      });
      const result: ApiResponse = response.data;
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
        // console.log("Approved agents + custom loaded:", agentsWithCustom.length);
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

  // New: Perform web search API call
  const performSearch = useCallback(async (query: string) => {
    setSearchLoading(true);
    try {
      const url = `https://meta.oxyloans.com/api/ai-service/agent/webSearchForAgent?message=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: userData?.accessToken || "",
        },
      });
      const result = response.data;
       console.log("Web search raw result:", result.data[0]);
      // Assume response format: { data: [{ title: string, snippet: string, url: string }] }
      // Map to AgentItem for consistent rendering
      const webAgents: AgentItem[] = (result.data || []).map((item: any) => ({
        id: item.url || Math.random().toString(),
        name: item.name || "Untitled Result",
        description: item.snippet || item.description || "No description available",
        instructions: item.snippet || item.description || "No description available",
        status: "APPROVED",
        price: "Free",
        rating: 4,
        imageUrl: WEB_IMAGE,
        url: item.url || item.link,
        isWeb: true,
      }));
      console.log("Web search result:", webAgents[0]);
      setSearchResults(webAgents);
    } catch (error) {
      console.error("Web search error:", error);
      Alert.alert("Search Error", "Failed to fetch web results. Showing local results.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // 🔹 Helper function (updated for web results)
  // const getAgentImage = (name: string | undefined, isWeb?: boolean, imageUrl?: string ): string => {
  //   if(imageUrl){
  //     return imageUrl;
  //   }
  //   // if (isWeb) {
  //   //   return WEB_IMAGE;
  //   // }
  //   // if (!name) {
  //   //   return DEFAULT_IMAGE[Math.floor(Math.random() * DEFAULT_IMAGE.length)];
  //   // }
  //   const lowerName = name?.toLowerCase();
  //   // Special case: OG Fan Story Predictor
  //   if (lowerName.includes("og")) {
  //     return IMAGE_MAP.og;
  //   }
  //   // Check for keywords in name
  //   for (const key in IMAGE_MAP) {
  //     if (lowerName.includes(key)) {
  //       return IMAGE_MAP[key as keyof typeof IMAGE_MAP];
  //     }
  //   }
  //   // Fallback random image
  //   return DEFAULT_IMAGE[Math.floor(Math.random() * DEFAULT_IMAGE.length)];
  // };

  const getAgentImage = (
  name: string | undefined,
  isWeb?: boolean,
  imageUrl?: string
): string => {
  // 1️⃣ If there's an image URL, return it
  if (imageUrl && imageUrl.trim() !== "") {
    return imageUrl;
  }

  // 2️⃣ If no name, return default placeholder text
  if (!name || name.trim() === "") {
    return "N/A";
  }

  // 3️⃣ Extract initials from the name
  const parts = name.trim().split(" ");
  let initials = "";

  if (parts.length === 1) {
    // Single name (e.g., "Sai")
    initials = parts[0][0].toUpperCase();
  } else {
    // Multiple words (e.g., "AI Bot")
    initials = parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  }

  // 4️⃣ Return initials (or you could return formatted like “AI Bot - AB”)
  return `${name} - ${initials}`;
};


  // Fixed: Use useFocusEffect properly
  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, loading agents...");
      getAgents(null, false);
      checkForOngoingBuilds(); // Check for ongoing builds
    }, [])
  );
  
  // 🔥 Check for ongoing builds when screen loads
  const checkForOngoingBuilds = async () => {
    try {
      console.log('🔍 Checking for ongoing APK builds...');
      
      // Load active builds from storage
      const storedBuilds = await AsyncStorage.getItem('activeBuildsByAgent');
      if (storedBuilds) {
        const builds = JSON.parse(storedBuilds);
        setActiveBuildsByAgent(builds);
        
        // Resume polling for each active build
        Object.entries(builds).forEach(([agentId, buildId]) => {
          console.log(`🔄 Resuming polling for agent ${agentId}, build ${buildId}`);
          // Find agent name from loaded agents
          const agent = agents.find(a => 
            (a.id || a.assistantId || a.agentId) === agentId
          );
          const agentName = agent?.name || 'Unknown Agent';
          
          // Resume polling
          pollBuildStatus(buildId as string, agentId, agentName);
        });
      }
      
    } catch (error) {
      console.error('Error checking ongoing builds:', error);
    }
  };

  // Updated: Local filtering (always applies search to agents)
  useEffect(() => {
    console.log("Filtering local agents, total:", agents.length);
    const filtered: AgentItem[] = agents.filter((agent: AgentItem) => {
      const a: AgentItem = agent.assistant || agent;
      const text: string =
        `${a.name} ${a.instructions} ${a.description} ${a.model}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
    setLocalAgents(filtered);
    console.log("Local filtered agents:", filtered.length);
  }, [agents, search]);

  // New: Debounced web search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (search.trim()) {
      timeoutRef.current = setTimeout(() => performSearch(search), 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search, performSearch]);

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

  // 🔥 APK Generation Function (AUTOMATION TRIGGER)
  const generateAPK = async (agent: AgentItem) => {
    const agentId = agent.id || agent.assistantId || agent.agentId;
    if (!agentId) {
      Alert.alert("Error", "Agent ID not found");
      return;
    }

    try {
      setGeneratingApk(prev => ({ ...prev, [agentId]: true }));
      setBuildProgress(prev => ({ ...prev, [agentId]: { step: 1, message: 'Starting APK generation...', progress: 20 } }));
      
      // 👉 THIS TRIGGERS THE AUTOMATION - Use local backend
      const response = await axios.post(`${APK_BASE_URL}generate-apk`, {
        agentId: agentId,
        agentName: agent.name,
        userId: userData?.userId || "anonymous" // Use actual user ID from Redux
      }, {
        headers: {
          Accept: "*/*",
          Authorization: userData?.accessToken || "" // Use actual token from Redux
        }
      });
      
      if (response.data.success) {
        const buildId = response.data.buildId;
        setBuildProgress(prev => ({ ...prev, [agentId]: { step: 2, message: 'Build started on server...', progress: 50 } }));
        
        // Store active build for this agent
        setActiveBuildsByAgent(prev => ({ ...prev, [agentId]: buildId }));
        
        // Persist to storage
        AsyncStorage.setItem('activeBuildsByAgent', JSON.stringify({ ...activeBuildsByAgent, [agentId]: buildId }));
        AsyncStorage.setItem(`buildDetails_${buildId}`, JSON.stringify({
          agentId,
          agentName: agent.name,
          buildId,
          startTime: new Date().toISOString()
        }));
        
        // Show detailed build status
        setCurrentBuildId(buildId);
        setCurrentAgentName(agent.name || 'Unknown Agent');
        setShowBuildStatus(true);
        
        Alert.alert(
          '✅ APK Build Started!',
          `🔨 Building ${agent.name} APK...\n\n⏱️ Estimated time: 2-5 minutes\n🔔 Tap "View Details" to track progress`,
          [
            { text: 'View Details', onPress: () => setShowBuildStatus(true) },
            { text: 'OK', style: 'cancel' }
          ]
        );
        
        // 🔥 Poll for build status
        pollBuildStatus(buildId, agentId, agent.name);
        
      } else {
        throw new Error(response.data.error || 'APK generation failed');
      }
      
    } catch (error: any) {
      console.error('❌ APK Generation Error:', error);
      
      Alert.alert(
        '❌ APK Generation Failed',
        `😔 Could not create APK for ${agent.name}\n\n🔍 Error: ${error.message}\n\n🔄 Please try again or contact support.`,
        [
          { text: 'Retry', onPress: () => generateAPK(agent) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      
      // Clear progress immediately on error
      setGeneratingApk(prev => ({ ...prev, [agentId]: false }));
      setBuildProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[agentId];
        return newProgress;
      });
    }
  };
  
  // 🔥 Poll Build Status Function (SIMPLIFIED)
  const pollBuildStatus = async (buildId: string, agentId: string, agentName: string) => {
    console.log(`🔄 Starting polling for build ${buildId}`);
    
    const poll = async () => {
      try {
        console.log(`🔍 Checking build status for ${buildId}`);
        const response = await axios.get(`${APK_BASE_URL}build-status/${buildId}`);
        
        if (response.data.success && response.data.build) {
          const build = response.data.build;
          console.log(`📊 Build status: ${build.status}`);
          
          if (build.status === 'completed' && build.apkUrl) {
            console.log(`✅ Build completed! APK URL: ${build.apkUrl}`);
            
            // Remove from active builds
            setActiveBuildsByAgent(prev => {
              const newBuilds = { ...prev };
              delete newBuilds[agentId];
              AsyncStorage.setItem('activeBuildsByAgent', JSON.stringify(newBuilds));
              return newBuilds;
            });
            
            // Show success alert with download
            Alert.alert(
              '🎉 APK Ready!',
              `✅ ${agentName} APK is ready!\n\n📥 Tap "Download" to get your APK`,
              [
                { 
                  text: 'Download Now', 
                  onPress: () => {
                    Linking.openURL(build.apkUrl).catch(() => {
                      Alert.alert('Error', 'Could not open download link');
                    });
                  }
                },
                { text: 'Later', style: 'cancel' }
              ]
            );
            
            // Clear states
            setGeneratingApk(prev => ({ ...prev, [agentId]: false }));
            setBuildProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[agentId];
              return newProgress;
            });
            
            return; // Stop polling
            
          } else if (build.status === 'failed') {
            console.log(`❌ Build failed for ${buildId}`);
            
            // Remove from active builds
            setActiveBuildsByAgent(prev => {
              const newBuilds = { ...prev };
              delete newBuilds[agentId];
              AsyncStorage.setItem('activeBuildsByAgent', JSON.stringify(newBuilds));
              return newBuilds;
            });
            
            Alert.alert(
              '❌ Build Failed',
              `😔 APK build failed for ${agentName}\n\n🔄 Please try again later.`,
              [{ text: 'OK' }]
            );
            
            // Clear states
            setGeneratingApk(prev => ({ ...prev, [agentId]: false }));
            setBuildProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[agentId];
              return newProgress;
            });
            
            return; // Stop polling
            
          } else {
            // Still building - continue polling
            console.log(`🔄 Build still in progress...`);
            setTimeout(poll, 10000); // Poll every 10 seconds
          }
        } else {
          console.log(`⚠️ Build not found, continuing to poll...`);
          setTimeout(poll, 10000);
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        setTimeout(poll, 10000); // Continue polling on error
      }
    };
    
    // Start polling after 10 seconds
    setTimeout(poll, 10000);
  };

  // Updated: Handle navigation for both local and web agents
  const goToChat = (agent: AgentItem): void => {
    if (agent.isWeb && agent.url) {
      // Open web result in browser
      Linking.openURL(agent.url).catch((err) => {
        console.error("Failed to open URL:", err);
        Alert.alert("Error", "Could not open link.");
      });
      return;
    }

    const assistant: AgentItem = agent.assistant || agent;
    const assistantId: string | undefined = assistant.id || assistant.assistantId;
    if (!assistantId) {
      Alert.alert("Error", "Assistant ID not found.");
      return;
    }
    if (assistant.name === "THE FAN OF OG") {
      // navigation.navigate("Image Creator", {
      // assistantId,
      // query: "",
      // category: "Fan of OG",
      // agentName: "Fan of OG",
      // fd: null,
      // agentId: assistant.agentId,
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
      // assistantId,
      // query: "",
      // category: "Assistant",
      // agentName: assistant.name || "Assistant",
      // fd: null,
      // agentId: assistant.agentId,
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

  // Truncate description (unchanged)
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
  const agentImage: string = getAgentImage(agent.name, agent.isWeb, agent.imageUrl);
  const isWebResult: boolean = !!agent.isWeb;
  
  // 🔥 APK Generation States for this agent
  const agentId = agent.id || agent.assistantId || agent.agentId || 'unknown';
  const isGenerating = generatingApk[agentId] || false;
  const progress = buildProgress[agentId];

  // Check if it's a valid image URL
  const isImageUrl = agentImage.startsWith("http") || agentImage.startsWith("https");

  // 🌈 Generate deterministic gradient for each agent name
  const getGradientFromName = (name: string | undefined): string[] => {
    if (!name) return ["#9CA3AF", "#6B7280"]; // gray fallback
    const gradients = [
      ["#FF9A9E", "#FAD0C4"],
      ["#A18CD1", "#FBC2EB"],
      ["#F6D365", "#FDA085"],
      ["#84FAB0", "#8FD3F4"],
      ["#FFDEE9", "#B5FFFC"],
      ["#C6EA8D", "#FE90AF"],
      ["#E0C3FC", "#8EC5FC"],
      ["#FFD3A5", "#FD6585"],
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const gradientColors = getGradientFromName(agent.name);
  const initials = agentImage.replace(`${agent.name} - `, "");

  return (
    <TouchableOpacity
      style={[
        styles.agentCard,
        isGridMode ? styles.gridCard : styles.listCard,
      ]}
      onPress={() => goToChat(agent)}
      activeOpacity={0.8}
    >
      {/* 🔹 Agent Image / Gradient Avatar */}
      <View style={[styles.imageContainer, isGridMode && styles.fullImageContainer]}>
        {isImageUrl ? (
          <Image
            source={{ uri: agentImage }}
            style={[isGridMode ? styles.fullAgentImage : styles.listImage]}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={gradientColors as [string, string]}
            style={[isGridMode ? styles.fullAgentImage : styles.listImage,styles.circularAvatar]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.fallbackText}>{initials}</Text>
          </LinearGradient>
        )}
      </View>

      {/* 🔹 Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.agentName} numberOfLines={2}>
            {agent.name || "Unnamed Assistant"}
          </Text>
          <View style={styles.metaRow}>
            {isWebResult ? (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: "#3B82F6" },
                ]}
              >
                <Text style={styles.statusText}>Web</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor("active") },
                ]}
              >
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            )}
            <Text style={styles.price}>
              {price === "Free" ? "Free" : `₹${price}`}
            </Text>
          </View>
        </View>
      </View>

      {/* 🔹 Description */}
      <Text style={styles.agentPreview} numberOfLines={isGridMode ? 2 : 3}>
        {getPreview(agent.description || agent.instructions)}
      </Text>

      {/* 🔹 Rating & Buttons */}
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
        
        {/* 🔥 DOWNLOAD APK BUTTON - AUTOMATION TRIGGER */}
        {!isWebResult && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.useButton}
              onPress={() => goToChat(agent)}
            >
              <Text style={styles.useButtonText}>Use Agent</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.downloadButton,
                isGenerating && styles.downloadButtonDisabled
              ]}
              onPress={() => {
                const activeBuildId = activeBuildsByAgent[agentId];
                if (activeBuildId) {
                  // Show existing build status
                  setCurrentBuildId(activeBuildId);
                  setCurrentAgentName(agent.name || 'Unknown Agent');
                  setShowBuildStatus(true);
                } else {
                  // Start new APK generation
                  generateAPK(agent);
                }
              }}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.downloadButtonText}>
                    {activeBuildsByAgent[agentId] ? '📄 Status' : '📥 APK'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Web results - single button */}
        {isWebResult && (
          <TouchableOpacity
            style={styles.useButton}
            onPress={() => goToChat(agent)}
          >
            <Text style={styles.useButtonText}>Open Link</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 🔥 APK Build Progress Indicator */}
      {progress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.message}</Text>
        </View>
      )}

      {/* Corner Accent */}
      <View style={styles.cornerAccent} />
    </TouchableOpacity>
  );
};



  const getStatusColor = (status: string): string => {
    return status === "active" ? "#10B981" : "#64748B";
  };

  // Updated: Display data logic
  const displayAgents = search.trim() ? searchResults : localAgents;
  const shouldShowLoadMore: boolean = !!lastId && agents.length > 0 && !search.trim();

  const renderEmpty = (): React.ReactElement => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>
          {search.trim() ? "🔍" : "🤖"}
        </Text>
      </View>
      <Text style={styles.emptyTitle}>
        {search.trim() ? "No web results found" : "No assistants available"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {search.trim()
          ? "Try a different search term for web results"
          : "Check back later for new assistants"}
      </Text>
      {!loading && !search.trim() && (
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Updated: Header with search loading indicator
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
          {searchLoading && <ActivityIndicator size="small" color="#8B5CF6" style={styles.loadingIndicator} />}
          {search.length > 0 && !searchLoading && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* <TouchableOpacity
        onPress={() => router.push("/(auth)/register")}
      >
        <AIRoleImage />
      </TouchableOpacity> */}
      {/* Stats & View Toggle */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {search.trim() 
            ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
            : `${localAgents.length} assistant${localAgents.length !== 1 ? "s" : ""} available`
          }
        </Text>
        <View style={styles.viewToggle}>
          <ActivityIndicator
            size="large"
            color="#8B5CF6"
            animating={loadingMore}
          />
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );

  // Improved loading screen (unchanged)
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
          data={displayAgents}
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
          ListHeaderComponent={
            search.trim() && searchLoading ? (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.searchLoadingText}>Searching the web...</Text>
              </View>
            ) : null
          }
          initialNumToRender={10}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
        />
      </View>
      {/* Enhanced Load More Button (only for local, not web search) */}
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
      
      {/* 🔥 APK Build Status Modal */}
      <APKBuildStatus
        visible={showBuildStatus}
        buildId={currentBuildId}
        agentName={currentAgentName}
        onClose={() => setShowBuildStatus(false)}
      />
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
  loadingIndicator: { // New: For search loading in input
    marginLeft: 8,
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
    marginTop: 10,
  },
  statsText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  viewToggle: {
    flexDirection: "row",
    // backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 5,
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
 fullImageContainer: {
  width: "100%",
  height: 160,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  overflow: "hidden",
},

fullAgentImage: {
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
},

circularAvatar: {
   width: "100%",
  height: 120,
  borderRadius: 30,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},

fallbackText: {
  fontSize: 42,
  fontWeight: "900",
  color: "#fff",
  textAlign: "center",
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
  // New: For web search loading header
  searchLoadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  searchLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
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
  
  // 🔥 APK Generation Styles
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 1,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
  },
  progressContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
});