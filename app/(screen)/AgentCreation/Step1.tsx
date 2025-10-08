import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity, ScrollView } from "react-native";
import axios, { AxiosResponse } from "axios";
import BASE_URL from "../../../config";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/types";

// Interface for UserType
interface UserType {
  label: string;
  value: string;
}

// User state interface
interface UserState {
  accessToken: string;
  userId: string;
  mobileNumber?: string;
  whatsappNumber?: string;
}

// FormData interface with all required properties
interface FormData {
  agentName: string;
  domain: string;
  subDomain?: string;
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
  customUserRole?: string;
  rateThisPlatform: number;
  userExperience: number;
  shareYourFeedback?: string;
  creatorName: string;
  userExperienceSummary?: string;
  strengths?: string;
}

// Interface for Step1 props
interface Step1Props {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
}

const Step1: React.FC<Step1Props> = ({ formData, handleChange }) => {
  const [userTypes, setUserTypes] = useState<UserType[]>([
    { label: "Advocate", value: "Advocate" },
    { label: "Chartered Accountant (CA)", value: "CA" },
    { label: "Company Secretary (CS)", value: "CS" },
    { label: "Consultant", value: "Consultant" },
    { label: "Teacher", value: "Teacher" },
    { label: "Doctor", value: "Doctor" },
    { label: "Engineer", value: "Engineer" },
    { label: "Lawyer", value: "Lawyer" },
    { label: "Startup Founder", value: "Startup Founder" },
    { label: "Entrepreneur", value: "Entrepreneur" },
    { label: "Investor", value: "Investor" },
    { label: "Banker", value: "Banker" },
    { label: "Software Developer", value: "Software Developer" },
    { label: "Data Scientist", value: "Data Scientist" },
    { label: "AI / ML Expert", value: "AI/ML Expert" },
    { label: "Researcher", value: "Researcher" },
    { label: "Designer", value: "Designer" },
    { label: "Marketing Specialist", value: "Marketing Specialist" },
    { label: "HR Professional", value: "HR Professional" },
    { label: "Operations Manager", value: "Operations Manager" },
    { label: "Sales Executive", value: "Sales Executive" },
    { label: "Product Manager", value: "Product Manager" },
    { label: "CXO (CEO / CTO / CFO etc.)", value: "CXO" },
    { label: "Freelancer", value: "Freelancer" },
    { label: "Business Consultant", value: "Consultant" },
    { label: "Other", value: "Other" },
  ]);

  const user = useSelector<RootState, UserState>((state) => state.userData as UserState);
  const userId = user?.userId;

  // Simple dropdown component
  const SimpleDropdown: React.FC<{
    data: UserType[];
    value: string;
    onSelect: (item: UserType) => void;
    placeholder: string;
  }> = ({ data, value, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = data.find(item => item.value === value);
    
    return (
      <View>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setIsOpen(!isOpen)}
        >
          <Text style={selectedItem ? styles.selectedTextStyle : styles.placeholderStyle}>
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={{ maxHeight: 200 }}>
              {data.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.itemTextStyle}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const languages: UserType[] = [
    { label: "English", value: "English" },
    { label: "తెలుగు", value: "తెలుగు" },
    { label: "हिंदी", value: "हिंदी" },
  ];

  useEffect(() => {
    getProfile();
    
    if (
      formData.userRole &&
      formData.userRole !== "Other" &&
      !userTypes.some((userType: UserType) => userType.value === formData.userRole)
    ) {
      setUserTypes((prev) => [
        ...prev,
        { label: formData.userRole, value: formData.userRole },
      ]);
    }
  }, [formData.userRole]); // Added dependency for formData.userRole to handle updates

  const getProfile = (): void => {
    axios
      .get(`${BASE_URL}user-service/getProfile/${userId}`)
      .then((response: AxiosResponse) => {
        console.log("Profile data", response.data);
        if (response.data?.userName) {
          handleChange("creatorName", response.data.userName);
        }
      })
      .catch((error) => {
        console.log("Profile error", error);
      });
  };

  // Handle user role selection
  const handleDomainChange = (item: UserType): void => {
    console.log("Selected domain:", item);
    handleChange("userRole", item.value);
    if (item.value === "Other") {
      console.log("Selected :", item);
      handleChange("customUserRole", ""); // Clear custom role when selecting Other
    }
  };

  // Handle language selection
  const handleLanguage = (item: UserType): void => {
    handleChange("language", item.value);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Agent Creator Profile</Text>

      <Text style={styles.label}>AI Agent Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter agent name"
        placeholderTextColor="#94A3B8"
        value={formData.agentName}
        onChangeText={(v: string) => handleChange("agentName", v)}
        accessible={true}
        accessibilityLabel="Agent Name"
      />

      <Text style={styles.label}>Creator Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Creator Name"
        placeholderTextColor="#94A3B8"
        value={formData.creatorName}
        onChangeText={(v: string) => handleChange("creatorName", v)}
        accessible={true}
        accessibilityLabel="Creator Name"
      />

      <Text style={styles.label}>Professional Identity of the Creator *</Text>
      <SimpleDropdown
        data={userTypes}
        value={formData.userRole}
        placeholder="Select a role"
        onSelect={handleDomainChange}
      />
      {formData.userRole === "Other" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your profession"
            placeholderTextColor="#94A3B8"
            value={formData.customUserRole}
            onChangeText={(v: string) => handleChange("customUserRole", v)}
            accessible={true}
            accessibilityLabel="Custom User Role"
          />
        </>
      )}

      <Text style={styles.label}>Creator Experience Overview (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Creator Experience Overview"
        placeholderTextColor="#94A3B8"
        value={formData.userExperienceSummary}
        onChangeText={(v: string) => handleChange("userExperienceSummary", v)}
        accessible={true}
        accessibilityLabel="Creator Experience Overview"
        multiline={true}
      />

      <Text style={styles.label}>Problems Solved in the Past (Description) *</Text>
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#94A3B8"
        value={formData.description}
        onChangeText={(v: string) => handleChange("description", v)}
        accessible={true}
        accessibilityLabel="Description"
        multiline={true}
      />

      <Text style={styles.label}>Your Strengths in the Field (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Strengths"
        placeholderTextColor="#94A3B8"
        value={formData.strengths}
        onChangeText={(v: string) => handleChange("strengths", v)}
        accessible={true}
        accessibilityLabel="Strengths"
        multiline={true}
      />

      <Text style={styles.label}>Preferred Language</Text>
      <SimpleDropdown
        data={languages}
        value={formData.language}
        placeholder="Select a language"
        onSelect={handleLanguage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#1F2937",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    height: 50, // Consistent with input height
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  itemTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    // marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginRight: 10,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});

export default Step1;