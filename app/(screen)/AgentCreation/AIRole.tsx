import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, SafeAreaView } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { useNavigation, useFocusEffect, NavigationProp } from "@react-navigation/native";
import axios, { AxiosResponse } from "axios";
import BASE_URL from "../../../config";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/types"; // Assuming RootState is defined in your store
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// Interface for Role Item
interface RoleItem {
  id: string | number;
  headerTitle: string;
  description?: string;
  discription?: string; // Note: Likely a typo in original code; consider standardizing to 'description'
}

// Interface for Translations
interface Translations {
  headerTitle: string;
  headerSubtitle: string;
  continueButton: (roleTitle: string) => string;
}

// Interface for Description Translations Mapping
interface DescriptionTranslations {
  [key: string]: {
    en: string;
    te: string;
    hi: string;
  };
}

// Sample translations for static text
const translations: Record<string, Translations> = {
  en: {
    headerTitle: "Choose Your AI Role",
    headerSubtitle: "Select a role to get started. You can change this later.",
    continueButton: (roleTitle) => `Continue as ${roleTitle}`,
  },
  te: {
    headerTitle: "మీ AI పాత్రను ఎంచుకోండి",
    headerSubtitle: "ప్రారంభించడానికి ఒక పాత్రను ఎంచుకోండి. మీరు దీనిని తర్వాత మార్చవచ్చు.",
    continueButton: (roleTitle) => `${roleTitle} గా కొనసాగండి`,
  },
  hi: {
    headerTitle: "अपनी AI भूमिका चुनें",
    headerSubtitle: "शुरू करने के लिए एक भूमिका चुनें। आप इसे बाद में बदल सकते हैं।",
    continueButton: (roleTitle) => `${roleTitle} के रूप में जारी रखें`,
  },
};

// Sample static mapping for role descriptions (replace with actual translations or API)
const descriptionTranslations: DescriptionTranslations = {
  // Example: Assume API returns descriptions like "Manages user accounts and permissions"
  "Manages user accounts and permissions": {
    en: "Manages user accounts and permissions",
    te: "వినియోగదారు ఖాతాలు మరియు అనుమతులను నిర్వహిస్తుంది",
    hi: "उपयोगकर्ता खातों और अनुमतियों का प्रबंधन करता है",
  },
  // Add more mappings based on actual API descriptions
  // Fallback: If description not in mapping, use English
};

// Type for supported languages
type SupportedLanguage = 'en' | 'te' | 'hi';

// Placeholder function to translate role descriptions
const translateDescription = (description: string | undefined, language: SupportedLanguage): string => {
  if (!description) return "";
  // Use static mapping if available
  const translationMap = descriptionTranslations[description];
  if (translationMap && language in translationMap) {
    return translationMap[language] || description;
  }
  // Fallback placeholder for untranslated descriptions
  return description;
};

// Template for real translation API (uncomment and configure)
// const translateDescription = async (description: string, language: string): Promise<string> => {
//   if (!description || language === "en") return description;
//   try {
//     const response: AxiosResponse<{ translatedText: string }> = await axios.post(
//       "https://x.ai/api/translate", // Replace with actual translation API endpoint
//       {
//         text: description,
//         target_language: language, // e.g., "te" for Telugu, "hi" for Hindi
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`, // Use your auth token
//         },
//       }
//     );
//     return response.data.translatedText || description;
//   } catch (error) {
//     console.error("Translation Error:", error);
//     return description; // Fallback to English
//   }
// };

// Interface for RoleCard Props
interface RoleCardProps {
  item: RoleItem;
  index: number;
  selectedRole: string | number | null;
  handleRoleSelect: (item: RoleItem) => void;
  language: SupportedLanguage;
}

// Separate component for RoleCard to use hooks correctly
const RoleCard: React.FC<RoleCardProps> = ({ item, index, selectedRole, handleRoleSelect, language }) => {
  const [translatedDescription, setTranslatedDescription] = useState<string>(item.description || item.discription || "");
  const scale = useSharedValue<number>(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  useEffect(() => {
    // For static mapping
    setTranslatedDescription(translateDescription(item.description || item.discription, language));
    
    // For real translation API (uncomment and use instead)
    // const fetchTranslation = async (): Promise<void> => {
    //   const text = await translateDescription(item.description || item.discription || "", language);
    //   setTranslatedDescription(text);
    // };
    // fetchTranslation();
  }, [language, item.description, item.discription]);

  const onPressIn = (): void => {
    scale.value = 0.95;
  };

  const onPressOut = (): void => {
    scale.value = 1;
  };

  return (
    <Animated.View style={[styles.roleCard, index === 0 && styles.firstCard, animatedStyle]}>
      <TouchableOpacity
        style={[styles.cardContent, selectedRole === item.id && styles.selectedCard]}
        onPress={() => handleRoleSelect(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        accessibilityLabel={`Select ${item.headerTitle} role`}
      >
        <Text style={styles.roleTitle}>{item.headerTitle}</Text>
        <Text style={styles.roleDescription}>{translatedDescription}</Text>
        <TouchableOpacity
          style={[styles.continueButton, selectedRole === item.id && styles.selectedButton]}
          onPress={() => handleRoleSelect(item)}
        >
          <Text style={styles.buttonText}>{translations[language]?.continueButton(item.headerTitle) || `Continue as ${item.headerTitle}`}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Interface for Navigation (adjust RootParamList as per your navigator)
interface RootParamList {
  "Agent Creation": undefined;
  // Add other routes as needed
}

// Main Component Interface
const AIRoleSelection: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string | number | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("en"); // Default to English

   const token = useSelector((state: RootState) => state.userData?.accessToken);
     const userId = useSelector((state: RootState) => state.userData?.userId);
     const user = useSelector((state: RootState) => state.userData);

  const getRoles = useCallback(async (): Promise<void> => {
    console.log("Fetching roles...");
    setLoading(true);
    const url = `${BASE_URL}ai-service/agent/getAgentHeaders`;
    console.log("URL:", url);

    try {
      const response: AxiosResponse<RoleItem[]> = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Success - Roles response:", response.data);
      setRoles(response.data);
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      getRoles();
    }, [getRoles])
  );

  const handleRoleSelect = useCallback(
    (item: RoleItem): void => {
      setSelectedRole(item.id);
       router.push({
        pathname: '/(screen)/AgentCreation/agentCreation',
        params:  { selectedRole: item.headerTitle }, // ✅ Pass countryCode as param
      });
      console.log("Selected role:", item);
    },
    [router]
  );

  const renderItem = useCallback(({ item, index }: { item: RoleItem; index: number }): React.ReactElement => (
    <RoleCard
      item={item}
      index={index}
      selectedRole={selectedRole}
      handleRoleSelect={handleRoleSelect}
      language={language}
    />
  ), [selectedRole, handleRoleSelect, language]);

  const renderHeader = useCallback((): React.ReactElement => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{translations[language]?.headerTitle || "Choose Your AI Role"}</Text>
      <Text style={styles.headerSubtitle}>{translations[language]?.headerSubtitle || "Select a role to get started"}</Text>
      {/* <FlatList
        data={["en", "te", "hi"]}
        horizontal
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.langButton, language === item && styles.activeLang]}
            onPress={() => setLanguage(item)}
            accessibilityLabel={`Switch to ${item === "en" ? "English" : item === "te" ? "Telugu" : "Hindi"}`}
          >
            <Text style={[styles.langText, language === item && styles.activeLangText]}>
              {item === "en" ? "English" : item === "te" ? "తెలుగు" : "हिंदी"}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.languageSelector}
      /> */}
    </View>
  ), [language]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={roles}
        keyExtractor={(item: RoleItem) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        numColumns={1}
        refreshing={loading}
        onRefresh={getRoles}
      />
    </SafeAreaView>
  );
};

export default AIRoleSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#121212",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  languageSelector: {
    paddingVertical: 8,
    gap: 8,
  },
  langButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  activeLang: {
    backgroundColor: "#4B0082",
  },
  langText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  activeLangText: {
    color: "#fff",
    fontWeight: "600",
  },
  roleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  firstCard: {
    marginTop: 8,
  },
  selectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4B0082",
    backgroundColor: "#f8fafd",
  },
  cardContent: {
    padding: 20,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#121212",
    marginBottom: 12,
    textAlign: "left",
  },
  roleDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: "#4B0082",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedButton: {
    backgroundColor: "#4B0082",
    opacity: 0.9,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});