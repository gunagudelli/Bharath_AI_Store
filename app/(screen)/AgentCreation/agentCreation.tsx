import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5Preview from "./Step5Preview";
import axios, { AxiosResponse } from "axios";
import BASE_URL from "../../../config";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/types";  // Unused import; consider removing if not needed
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Interface for CustomButton props
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
}

// Interface for AgentData (inferred from API response usage)
interface AgentData {
  id?: string;
  agentName?: string;
  userRole?: string;
  customDomain?: string;
  name?: string;
  gender?: string;
  description?: string;
  creatorExperience?: string;
  strengths?: string;
  language?: string;
  voiceStatus?: boolean;
  business?: string;
  domain?: string;
  customDomain_Sector?: string;
  subDomain?: string;
  customSubDomain_Subsector?: string;
  GPT_Model?: string;
  usageModel?: string;
  isSolvingProblem?: string;
  mainProblemSolved?: string;
  uniqueSolution?: string;
  targetUser?: string | string[];
  ageLimit?: string | string[];
  converstionTone?: string;
  responseFormat?: string;
  instructions?: string;
  conStarter1?: string;
  conStarter2?: string;
  conStarter3?: string;
  conStarter4?: string;
  contactDetails?: string;
  rateThisPlatform?: number;
  shareYourFeedback?: string;
  userExperience?: number;
  userExperienceSummary?: string;
}

// Interface for RouteParams
interface RouteParams {
  agentData?: AgentData;
  selectedRole?: string;
}

// Interface for AgentCreationScreen props
interface AgentCreationScreenProps {
  route: { params?: RouteParams };
}

// Interface for AgentFormData state
interface AgentFormData {
  agentName: string;
  domain: string;
  customDomain: string;
  creatorName: string;
  gender: string;
  description: string;
  creatorExperience: string;
  strengths: string;
  language: string;
  voiceStatus: boolean;
  business_idea: string;
  Domain_Sector: string;
  customDomain_Sector: string;
  SubDomain_Subsector: string;
  customSubDomain_Subsector: string;
  GPT_Model: string;
  gptModel: string;
  targetUser: string;
  isSolvingProblem: string;
  mainProblemSolved: string;
  uniqueSolution: string;
  business: string;
  targetCustomers: string[];
  targetAgeLimit: string[];
  targetGender: string[];
  conversationTone: string;
  responseFormat: string;
  usageModel: string;
  instructions: string;
  conStarter1: string;
  conStarter2: string;
  conStarter3: string;
  conStarter4: string;
  contactDetails: string;
  userRole: string;
  customUserRole: string;
  rateThisPlatform: number;
  shareYourFeedback: string;
  userExperience: number;
  userExperienceSummary: string;
  agentId: string;
}

// User state from Redux (inferred)
interface UserState {
  accessToken: string;
  userId: string;
  mobileNumber?: string;
  whatsappNumber?: string;
}

// CustomButton component with typed props
export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}) => (
  <TouchableOpacity
    style={[
      styles.customButton,
      variant === "primary" ? styles.primaryButton : styles.secondaryButton,
      disabled && styles.disabledButton,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    accessible={true}
    accessibilityLabel={title}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={
        variant === "primary" && !disabled
          ? ["#6366F1", "#8B5CF6"]
          : ["#F3F4F6", "#E5E7EB"]
      }
      style={styles.buttonGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : "#374151"}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "secondary" && styles.secondaryButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

const AgentCreationScreen: React.FC<AgentCreationScreenProps> = ({ route }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [instructionOptions, setInstructionOptions] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fadeAnim] = useState<Animated.Value>(new Animated.Value(1));
  const [slideAnim] = useState<Animated.Value>(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [instructionLoading, setInstructionLoading] = useState<boolean>(false);
  const [isUpdateMode, setIsUpdateMode] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string>(""); // default Bharat AI Store
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  
    const token = useSelector((state: RootState) => state.userData?.accessToken);
   const userId = useSelector((state: RootState) => state.userData?.userId);
   const user = useSelector((state: RootState) => state.userData);

  const initialFormData: AgentFormData = {
    agentName: "",
    domain: "",
    customDomain: "",
    creatorName: "",
    gender: "",
    description: "",
    creatorExperience: "",
    strengths: "",
    language: "",
    voiceStatus: true,
    business_idea: "",
    Domain_Sector: "",
    customDomain_Sector: "",
    SubDomain_Subsector: "",
    customSubDomain_Subsector: "",
    GPT_Model: "",
    gptModel: "",
    targetUser: "",
    isSolvingProblem: "",
    mainProblemSolved: "",
    uniqueSolution: "",
    business: "",
    targetCustomers: [],
    targetAgeLimit: [],
    targetGender: [],
    conversationTone: "",
    responseFormat: "",
    usageModel: "",
    instructions: "",
    conStarter1: "",
    conStarter2: "",
    conStarter3: "",
    conStarter4: "",
    contactDetails: "",
    userRole: "",
    customUserRole: "",
    rateThisPlatform: 0,
    shareYourFeedback: "",
    userExperience: 0,
    userExperienceSummary: "",
    agentId: "",
  };

  const [formData, setFormData] = useState<AgentFormData>(initialFormData);

  const mapAgentDataToFormData = useCallback((agentData: AgentData): AgentFormData => ({
    agentName: agentData.agentName || "",
    domain: agentData.userRole || "",
    customDomain: agentData.customDomain || "",
    creatorName: agentData.name || "",
    gender: agentData.gender || "",
    description: agentData.description || "",
    creatorExperience: agentData.creatorExperience || "",
    strengths: agentData.strengths || "",
    language: agentData.language || "",
    voiceStatus: agentData.voiceStatus ?? true,
    business_idea: agentData.business || "",
    Domain_Sector: agentData.domain || "",
    customDomain_Sector: agentData.customDomain_Sector || "",
    SubDomain_Subsector: agentData.subDomain || "",
    customSubDomain_Subsector: agentData.customSubDomain_Subsector || "",
    GPT_Model: agentData.GPT_Model || "",
    gptModel: agentData.usageModel || "",
    targetUser: typeof agentData.targetUser === "string" ? agentData.targetUser : (agentData.targetUser || []).join(","),
    isSolvingProblem: agentData.isSolvingProblem || "",
    mainProblemSolved: agentData.mainProblemSolved || "",
    uniqueSolution: agentData.uniqueSolution || "",
    business: agentData.business || "",
    targetCustomers: typeof agentData.targetUser === "string"
      ? agentData.targetUser.split(",").map((item) => item.trim()).filter(Boolean)
      : agentData.targetUser || [],
    targetAgeLimit: typeof agentData.ageLimit === "string"
      ? agentData.ageLimit.split(",").map((item) => item.trim()).filter(Boolean)
      : agentData.ageLimit || [],
    targetGender: typeof agentData.gender === "string" // Note: This reuses gender, but in context it's targetGender
      ? agentData.gender.split(",").map((item) => item.trim()).filter(Boolean)
      : agentData.gender || [],
    conversationTone: agentData.converstionTone || "",
    responseFormat: agentData.responseFormat || "",
    usageModel: agentData.usageModel || "",
    instructions: agentData.instructions || "",
    conStarter1: agentData.conStarter1 || "",
    conStarter2: agentData.conStarter2 || "",
    conStarter3: agentData.conStarter3 || "",
    conStarter4: agentData.conStarter4 || "",
    contactDetails: agentData.contactDetails || "",
    userRole: agentData.userRole || "",
    customUserRole: "",
    rateThisPlatform: agentData.rateThisPlatform || 0,
    shareYourFeedback: agentData.shareYourFeedback || "",
    userExperience: agentData.userExperience || 0,
    userExperienceSummary: agentData.userExperienceSummary || "",
    agentId: agentData.id || "",
  }), []);

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.agentData) {
        console.log("Editing agent data:", route.params.agentData);
        setIsUpdateMode(true);
        setFormData(mapAgentDataToFormData(route.params.agentData));
      } else if (route?.params?.selectedRole) { 
        setSelectedRole(route.params.selectedRole);
      } else {
        setIsUpdateMode(false);
        setFormData(initialFormData);
      }
      setIsDataLoaded(true);
    }, [route?.params?.agentData, mapAgentDataToFormData])
  );

  useEffect(() => {
    getProfile();
  }, []);

  // Fetch profile data and update contact details if shared
  const getProfile = useCallback(async (): Promise<void> => {
    try {
      const response: AxiosResponse = await axios.get(`${BASE_URL}user-service/getProfile/${userId}`);
      if (response.data?.shareContactDetails) {
        handleChange("contactDetails", response.data.whatsappNumber ?? response.data.mobileNumber);
      }
    } catch (error) {
      console.log("Profile error", error);
    }
  }, [userId]);

  // Handle form field changes with type safety
  const handleChange = useCallback((field: keyof AgentFormData, value: any): void => {
    let typedValue = value;
    if (field === "rateThisPlatform" || field === "userExperience") {
      typedValue = value ? parseInt(value, 10) || 0 : 0;
      if (typedValue > 5) typedValue = 5;
    }
    setFormData({ ...formData, [field]: typedValue });
  }, [formData]);

  // Fetch AI-generated instructions based on description
  const fetchInstructions = useCallback(async (): Promise<void> => {
    if (!formData.description) {
      Alert.alert("Info", "Please add a description first.");
      return;
    }
    setInstructionLoading(true);
    try {
      const response: AxiosResponse = await axios({
        url: `${BASE_URL}ai-service/agent/classifyInstruct?description=${formData.description}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
      });
      console.log("Instruction fetch response", response.data);
      setInstructionOptions(response.data || "");
    } catch (error: any) {
      console.log("error", error.response);
      Alert.alert("Error", "Failed to fetch suggestions.");
    } finally {
      setInstructionLoading(false);
    }
  }, [formData.description, token]);

  // Submit and publish the agent
  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    console.log("Submitting formData:", formData.agentId);
    const conStarters: string[] = [
      formData.conStarter1,
      formData.conStarter2,
      formData.conStarter3,
      formData.conStarter4,
    ].filter((item) => item && item.trim() !== "");

    const data: any = { // Typed as any for flexibility; consider defining a PublishData interface
      agentId: formData.agentId,
      userId: userId,
      agentStatus: "CREATED",
      rateThisPlatform: 0,
      chooseStore: selectedStore,
      conStarter1: formData.conStarter1 || "",
      conStarter3: formData.conStarter3 || "",
      conStarter2: formData.conStarter2 || "",
      conStarter4: formData.conStarter4 || "",
      status: "REQUESTED",
      activeStatus: true,
      voiceStatus: formData.voiceStatus,
    };

    conStarters.forEach((starter, index) => {
      data[`conStarter${index + 1}`] = starter;
    });

    console.log("Publishing final data:", data);

    try {
      const response: AxiosResponse = await axios({
        url: `${BASE_URL}ai-service/agent/agentPublish`,
        data: data,
        method: "patch",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Publish response", response.data);
      Alert.alert("Success", "Agent published successfully!");
      setModalVisible(false);
      setIsLoading(false);
      router.back()
    } catch (error: any) {
      console.error("Publish error", error.response);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to publish agent."
      );
      setIsLoading(false);
      setModalVisible(false);
    }
  }, [formData, userId, selectedStore, token]);

  // Validate current step's required fields
  const validateStep = useCallback((): boolean => {
    switch (step) {
      case 1:
        if (
          !formData.agentName ||
          !formData.creatorName ||
          !formData.userRole ||
          !formData.description ||
          !formData.language
        ) {
          setError("Please fill all required fields in Profile.");
          Alert.alert("Please fill all required fields in Profile.");
          return false;
        }
        break;
      case 2:
        if (
          !formData.business_idea ||
          !formData.Domain_Sector ||
          (formData.Domain_Sector === "Other" &&
            !formData.customDomain_Sector) ||
          !formData.SubDomain_Subsector ||
          (formData.SubDomain_Subsector === "Other" &&
            !formData.customSubDomain_Subsector) ||
          !formData.gptModel ||
          !formData.isSolvingProblem
        ) {
          setError(
            "Please fill the following before Continue: Business/Idea, Domain/Sector, Sub-Domain/Subsector, GPT Model, Are you solving a problem?"
          );
          Alert.alert(
            "Please fill the following before Continue: Business/Idea, Domain/Sector, Sub-Domain/Subsector, GPT Model, Are you solving a problem?"
          );
          return false;
        }
        if (
          formData.isSolvingProblem === "yes" &&
          !formData.mainProblemSolved
        ) {
          setError(
            "Please fill the main problem solved field as you indicated you are solving a problem."
          );
          Alert.alert(
            "Please fill the main problem solved field as you indicated you are solving a problem."
          );
          return false;
        }
        break;
      case 3:
        if (
          !formData.instructions ||
          !formData.conversationTone ||
          !formData.responseFormat ||
          !formData.targetGender.length ||
          !formData.targetAgeLimit.length ||
          !formData.targetCustomers.length
        ) {
          setError(
            "Please fill the following before Continue: Target Audience Gender, Target Age Limit(s)."
          );
          Alert.alert(
            "Please fill the following before Continue: Target Audience Gender, Target Age Limit(s)."
          );
          return false;
        }
        break;
      case 4:
        const rating: number = parseInt(formData.rateThisPlatform as any, 10); // Cast due to string/number mix
        const ux: number = parseInt(formData.userExperience as any, 10);
        if (
          isNaN(rating) ||
          rating < 0 ||
          rating > 5 ||
          isNaN(ux) ||
          ux < 0 ||
          ux > 5
        ) {
          setError("Please provide valid ratings (0-5) before proceeding.");
          Alert.alert("Please provide valid ratings (0-5) before proceeding.");
          return false;
        }
        break;
    }
    setError("");
    return true;
  }, [step, formData]);

  // Animate step transition
  const animateTransition = useCallback((direction: "next" | "prev"): void => {
    const slideValue = direction === "next" ? -width : width;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideValue,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(direction === "next" ? step + 1 : step - 1);
      slideAnim.setValue(direction === "next" ? width : -width);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [step, fadeAnim, slideAnim]);

  const next = useCallback((): void => {
    if (validateStep()) {
      if (step < 5) animateTransition("next");
    }
  }, [validateStep, step, animateTransition]);

  // Handle next step submission with API calls
  const nextStep = useCallback(async (): Promise<void> => {
    if (step === 1 && validateStep()) {
      const data: any = {
        userId:userId,
        headerTitle: selectedRole,
        headerStatus: false,
        userRole: formData.userRole === "Other" ? formData.customUserRole : formData.userRole,
        description: formData.description,
        language: formData.language,
        name: formData.creatorName,
        agentName: formData.agentName,
        creatorName: formData.creatorName,
        agentId: formData.agentId || ""
      };
      console.log("Profile Screen data to submit", data);
      setIsLoading(true);
      try {
        const res: AxiosResponse = await axios.patch(`${BASE_URL}ai-service/agent/agentScreen1`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Profile Screen data response", res.data);
        setFormData({ ...formData, agentId: res.data.agentId });
        Alert.alert(
          "Success",
          "Profile information saved. Proceed to Business & GPT Model.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLoading(false);
                next();
              },
            },
          ]
        );
      } catch (err: any) {
        console.log("Screen 1 data error", err.response);
        setIsLoading(false);
      }
    }
    if (step === 2 && validateStep()) {
      const data: any = {
        agentId: formData.agentId,
        business: formData.business_idea,
        domain:
          formData.Domain_Sector === "Other"
            ? formData.customDomain_Sector
            : formData.Domain_Sector,
        responseFormat: formData.responseFormat,
        subDomain:
          formData.SubDomain_Subsector === "Other"
            ? formData.customSubDomain_Subsector
            : formData.SubDomain_Subsector,
        userId: userId,
        solveProblem: formData.isSolvingProblem,
        uniqueSolution: formData.uniqueSolution,
        usageModel: formData.gptModel,
        mainProblemSolved: formData.mainProblemSolved,
      };
      console.log("Business & GPT Model data", data);
      setIsLoading(true);
      try {
        const res: AxiosResponse = await axios.patch(`${BASE_URL}ai-service/agent/agentScreen2`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Business & GPT Model data response", res.data);
        Alert.alert(
          "Success",
          "Business & GPT Model information saved. Proceed to Audience & Configuration.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLoading(false);
                next();
              },
            },
          ]
        );
      } catch (err: any) {
        console.log("Screen 2 data error", err.response);
        setIsLoading(false);
      }
    }
    if (step === 3 && validateStep()) {
      const data: any = {
        ageLimit: formData.targetAgeLimit.join(","),
        agentId: formData.agentId,
        converstionTone: formData.conversationTone,
        gender: formData.targetGender.join(","),
        instructions: formData.instructions,
        targetUser: formData.targetCustomers.join(","),
        contactDetails: user?.mobileNumber || user?.whatsappNumber,
        shareContact: "YES",
        userId: user?.userId,
      };
      console.log("Audience & Configurations data", data);
      setIsLoading(true);
      try {
        const res: AxiosResponse = await axios.patch(`${BASE_URL}ai-service/agent/agentScreen3`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Audience & Configurations response", res.data);
        Alert.alert(
          "Success",
          "Audience & Configurations information saved. Proceed to Publish to create an agent.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLoading(false);
                next();
              },
            },
          ]
        );
      } catch (err: any) {
        console.log("Screen 3 data error", err.response);
        setIsLoading(false);
      }
    }
    if (step === 4) {
      setModalVisible(true);
      return;
    }
  }, [step, validateStep, formData, user, selectedRole, token, next]);

  const prevStep = useCallback((): void => {
    setError("");
    if (step > 1) animateTransition("prev");
  }, [step, animateTransition]);

  // Create a unified FormData interface for all steps
  const createUnifiedFormData = (data: AgentFormData) => ({
    ...data,
    subDomain: data.SubDomain_Subsector,
    ageLimit: data.targetAgeLimit,
    targetUser: data.targetCustomers,
  });

  // Create a wrapper handleChange function that maps field names
  const createHandleChangeWrapper = useCallback(() => {
    return (field: string, value: any) => {
      // Map FormData field names to AgentFormData field names
      const fieldMapping: Record<string, keyof AgentFormData> = {
        subDomain: 'SubDomain_Subsector',
        ageLimit: 'targetAgeLimit',
        targetUser: 'targetCustomers',
      };
      
      const mappedField = fieldMapping[field] || field as keyof AgentFormData;
      handleChange(mappedField, value);
    };
  }, [handleChange]);

  // Render current step component
  const renderStep = useCallback(() => {
    const unifiedData = createUnifiedFormData(formData);
    const wrappedHandleChange = createHandleChangeWrapper();
    
    switch (step) {
      case 1:
        return <Step1 formData={unifiedData} handleChange={wrappedHandleChange} />;
      case 2:
        return <Step2 formData={unifiedData} handleChange={wrappedHandleChange} />;
      case 3:
        return (
          <Step3
            formData={unifiedData}
            handleChange={wrappedHandleChange}
            instructionOptions={instructionOptions}
            fetchInstructions={fetchInstructions}
            isLoading={instructionLoading}
          />
        );
      case 4:
        return <Step4 formData={unifiedData} handleChange={wrappedHandleChange} />;
      case 5:
        return <Step5Preview formData={unifiedData} />;
      default:
        return null;
    }
  }, [step, formData, createHandleChangeWrapper, instructionOptions, fetchInstructions, instructionLoading]);

  // Render progress bar and steps
  const renderProgress = useCallback(() => {
    const steps = [
      { num: 1, label: "Profile", icon: "👤" },
      { num: 2, label: "Business & GPT Model", icon: "⚙️" },
      { num: 3, label: "Audience & Configuration", icon: "💡" },
      { num: 4, label: "Publish", icon: "🚀" },
    ];

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${((step - 1) / 4) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.stepsContainer}>
          {steps.map((s, i) => (
            <View
              key={i}
              style={[styles.progressStep, { flexBasis: `${100 / 5}%` }]}
            >
              <Animated.View
                style={[
                  styles.circle,
                  {
                    backgroundColor:
                      step > s.num
                        ? "#6366F1"
                        : step === s.num
                        ? "#6366F1"
                        : "#E5E7EB",
                    transform: [{ scale: step === s.num ? 1.1 : 1 }],
                  },
                ]}
              >
                {step > s.num ? (
                  <Text style={styles.circleText}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      step === s.num ? { color: "#fff" } : { color: "#9CA3AF" },
                    ]}
                  >
                    {s.num}
                  </Text>
                )}
              </Animated.View>
              <Text style={styles.stepIcon}>{s.icon}</Text>
              <Text
                style={[styles.stepLabel, step === s.num && styles.activeLabel]}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }, [step]);

  // Early return for loading state
  if (!isDataLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {renderProgress()}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            Step {step} of 4 • {Math.round((step / 4) * 100)}% Complete
          </Text>
        </View>
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.stepCard}>
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {error ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
              {renderStep()}
            </ScrollView>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <CustomButton
                title="← Back"
                onPress={prevStep}
                variant="secondary"
              />
            )}
            <View style={{ flex: 1 }} />
            {step < 5 ? (
              <CustomButton
                title="Next →"
                onPress={nextStep}
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
              />
            ) : (
              <CustomButton
                title={isUpdateMode ? "🚀 Update Agent" : "🚀 Create Agent"}
                onPress={handleSubmit}
                variant="primary"
                loading={isLoading}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Preview & Final Checks</Text>
            <Text style={styles.modalSubtitle}>
              {formData.agentName || "Your Agent"}
            </Text>
            {[
              formData.conStarter1,
              formData.conStarter2,
              formData.conStarter3,
              formData.conStarter4,
            ]
              .filter((item) => item && item.trim() !== "")
              .map((item, index) => (
                <Text key={index} style={styles.modalDesc}>
                  {item}
                </Text>
              ))}

            <View style={styles.storeOption}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  selectedStore === "Bharath ai store" && styles.radioSelected,
                ]}
                onPress={() => setSelectedStore("Bharath ai store")}
              />
              <Text style={styles.storeLabel}>Bharat AI Store (Free)</Text>
            </View>

            <View style={styles.storeOption}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  selectedStore === "oxy gpt" && styles.radioSelected,
                ]}
                onPress={() => setSelectedStore("oxy gpt")}
              />
              <Text style={styles.storeLabel}>
                OXY GPT Store ($19, Coming soon)
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setModalVisible(false);
                  setIsLoading(false);
                }}
              />
              <CustomButton
                title="Publish"
                onPress={handleSubmit}
                loading={isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  keyboardContainer: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    position: "relative",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  stepIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    fontWeight: "600",
  },
  activeLabel: {
    color: "#6366F1",
    fontWeight: "700",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginTop: 16,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  errorText: {
    color: "#DC2626",
    flex: 1,
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  customButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    minWidth: 120,
  },
  secondaryButton: {
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: "#374151",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  storeOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#6366F1",
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: "#6366F1",
  },
  storeLabel: {
    fontSize: 14,
    color: "#374151",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
});

export default AgentCreationScreen;