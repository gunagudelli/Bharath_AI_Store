import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

// Assuming FormData interface is defined elsewhere (e.g., in AgentCreationScreen)
interface FormData {
  agentName: string;
  domain: string;
  subDomain?: string; // Optional fields based on usage
  gender?: string;
  ageLimit?: string | string[];
  language: string;
  voiceStatus: boolean;
  description: string;
  targetUser?: string | string[];
  mainProblemSolved?: string;
  uniqueSolution?: string;
  business?: string;
  conversationTone: string;
  responseFormat: string;
  usageModel: string;
  instructions: string;
  conStarter1: string;
  conStarter2: string;
  conStarter3: string;
  conStarter4: string;
  contactDetails?: string;
  userRole: string;
  rateThisPlatform: number;
  userExperience: number;
  shareYourFeedback?: string;
  agentStatus?: string;
  status?: string;
  activeStatus?: boolean;
  // Add other fields as needed from the full FormData
}

// Interface for Step5Preview props
interface Step5PreviewProps {
  formData: FormData;
}

const Step5Preview: React.FC<Step5PreviewProps> = ({ formData }) => {
  // Hide internal fields
  const { agentStatus, status, activeStatus, ...previewData } = formData;
  
  // Group fields into sections
  const sections: Record<string, (keyof Omit<FormData, 'agentStatus' | 'status' | 'activeStatus'>)[]> = {
    "Basic Info": ["agentName", "domain", "subDomain", "gender", "ageLimit", "language", "voiceStatus"],
    "Purpose": ["description", "targetUser", "mainProblemSolved", "uniqueSolution", "business"],
    "Personality": ["conversationTone", "responseFormat", "usageModel", "instructions"],
    "Wrap Up": ["conStarter1", "conStarter2", "conStarter3", "conStarter4", "contactDetails", "userRole"],
    "Feedback": ["rateThisPlatform", "userExperience", "shareYourFeedback"],
  };

  // Helper function to format values for display
  const formatValue = (key: string, value: any): string => {
    if (value === true) return "Yes";
    if (value === false) return "No";
    if (typeof value === "number") return value.toString();
    if (Array.isArray(value)) return value.join(", "); // Handle arrays like ageLimit or targetUser
    return value || "-";
  };

  // Helper function to humanize field keys
  const humanizeKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str: string) => str.toUpperCase());
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.title}>Preview Your Agent</Text>
      {Object.entries(sections).map(([sectionTitle, fields]) => (
        <View key={sectionTitle} style={styles.section}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          {fields.map((key) => (
            <View key={key as string} style={styles.row}>
              <Text style={styles.label}>{humanizeKey(key as string)}:</Text>
              <Text style={styles.value}>{formatValue(key as string, previewData[key as keyof typeof previewData])}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 20, color: "#1F2937" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#6366F1" },
  row: { flexDirection: "row", marginBottom: 8, paddingVertical: 4 },
  label: { fontWeight: "600", width: 140, fontSize: 14, color: "#374151" },
  value: { flex: 1, fontSize: 14, color: "#333" },
});

export default Step5Preview;