import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import axios, { AxiosResponse } from "axios";
import BASE_URL from "../../../config";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/types";

const { height } = Dimensions.get("window");

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
  errors?: { [key: string]: string };
}

const Step1: React.FC<Step1Props> = ({ formData, handleChange, errors = {} }) => {
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
  }, [formData.userRole]);

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

  const handleInputBlur = (field: keyof FormData) => {
    // Optional: Additional blur logic if needed
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Agent Creator Profile</Text>

      <Text style={styles.label}>AI Agent Name * (Max 50 characters)</Text>
      <TextInput
        style={[styles.input, errors.agentName && styles.errorInput]}
        placeholder="Enter agent name"
        placeholderTextColor="#94A3B8"
        value={formData.agentName}
        onChangeText={(v: string) => handleChange("agentName", v)}
        onBlur={() => handleInputBlur("agentName")}
        maxLength={50}
        accessible={true}
        accessibilityLabel="Agent Name"
      />
      <Text style={styles.characterCount}>{formData.agentName.length}/50</Text>
      {errors.agentName && <Text style={styles.errorMessage}>{errors.agentName}</Text>}

      <Text style={styles.label}>Creator Name *</Text>
      <TextInput
        style={[styles.input, errors.creatorName && styles.errorInput]}
        placeholder="Enter Creator Name"
        placeholderTextColor="#94A3B8"
        value={formData.creatorName}
        onChangeText={(v: string) => handleChange("creatorName", v)}
        onBlur={() => handleInputBlur("creatorName")}
        accessible={true}
        accessibilityLabel="Creator Name"
      />
      {errors.creatorName && <Text style={styles.errorMessage}>{errors.creatorName}</Text>}

      <Text style={styles.label}>Professional Identity of the Creator *</Text>
      <Dropdown
        style={[styles.dropdown, errors.userRole && styles.errorInput]}
        containerStyle={styles.containerStyle}
        placeholderStyle={[styles.placeholderStyle, errors.userRole && styles.errorText]}
        selectedTextStyle={[styles.selectedTextStyle, errors.userRole && styles.errorText]}
        data={userTypes}
        search
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder="Select a role"
        searchPlaceholder="Search role..."
        value={formData.userRole}
        onChange={handleDomainChange}
        onBlur={() => handleInputBlur("userRole")}
      />
      {errors.userRole && <Text style={styles.errorMessage}>{errors.userRole}</Text>}
      {formData.userRole === "Other" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your profession"
            placeholderTextColor="#94A3B8"
            value={formData.customUserRole}
            onChangeText={(v: string) => handleChange("customUserRole", v)}
            maxLength={50}
            accessible={true}
            accessibilityLabel="Custom User Role"
          />
          <Text style={styles.characterCount}>{(formData.customUserRole || '').length}/50</Text>
        </>
      )}

      <Text style={styles.label}>Creator Experience Overview (optional) (Max 500 characters)</Text>
      <TextInput
        style={styles.input}
        placeholder="Creator Experience Overview"
        placeholderTextColor="#94A3B8"
        value={formData.userExperienceSummary}
        onChangeText={(v: string) => handleChange("userExperienceSummary", v)}
        maxLength={500}
        accessible={true}
        accessibilityLabel="Creator Experience Overview"
        multiline={true}
      />
      <Text style={styles.characterCount}>{(formData.userExperienceSummary || '').length}/500</Text>

      <Text style={styles.label}>Problems Solved in the Past (Description) * (Max 250 characters)</Text>
      <TextInput
        style={[styles.input, errors.description && styles.errorInput]}
        placeholder="Description"
        placeholderTextColor="#94A3B8"
        value={formData.description}
        onChangeText={(v: string) => handleChange("description", v)}
        onBlur={() => handleInputBlur("description")}
        maxLength={250}
        accessible={true}
        accessibilityLabel="Description"
        multiline={true}
      />
      <Text style={styles.characterCount}>{(formData.description || '').length}/250</Text>
      {errors.description && <Text style={styles.errorMessage}>{errors.description}</Text>}

      <Text style={styles.label}>Your Strengths in the Field (optional) (Max 150 characters)</Text>
      <TextInput
        style={styles.input}
        placeholder="Strengths"
        placeholderTextColor="#94A3B8"
        value={formData.strengths}
        onChangeText={(v: string) => handleChange("strengths", v)}
        maxLength={150}
        accessible={true}
        accessibilityLabel="Strengths"
        multiline={true}
      />
      <Text style={styles.characterCount}>{(formData.strengths || '').length}/150</Text>

      <Text style={styles.label}>Preferred Language</Text>
      <Dropdown
        style={[styles.dropdown, errors.language && styles.errorInput]}
        containerStyle={styles.dropdownContainer}
        placeholderStyle={[styles.placeholderStyle, errors.language && styles.errorText]}
        selectedTextStyle={[styles.selectedTextStyle, errors.language && styles.errorText]}
        data={languages}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder="Select a language"
        value={formData.language}
        onChange={handleLanguage}
        mode="modal"
        onBlur={() => handleInputBlur("language")}
      />
      {errors.language && <Text style={styles.errorMessage}>{errors.language}</Text>}
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
    height: 50,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#252222ff",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  containerStyle: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  itemTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
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
  errorInput: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 8,
  },
});

export default Step1;