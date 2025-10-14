import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";

// Interface for dropdown options
interface DropdownOption {
  label: string;
  value: string;
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
  rateThisPlatform: number;
  userExperience: number;
  shareYourFeedback?: string;
  targetCustomers: string[];
  targetAgeLimit: string[];
  targetGender: string[];
}

// Interface for Step3 props
interface Step3Props {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
  instructionOptions: string;
  fetchInstructions: () => void;
  isLoading: boolean;
  errors?: { [key: string]: string };
}

const Step3: React.FC<Step3Props> = ({ formData, handleChange, instructionOptions, fetchInstructions, isLoading, errors = {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [editableSuggestion, setEditableSuggestion] = useState('');

  // Conversation tone options
  const conversationToneOptions: DropdownOption[] = [
    { label: "Helpful, Professional", value: "Helpful, Professional" },
    { label: "Friendly, Supportive", value: "Friendly, Supportive" },
    { label: "Formal, Concise", value: "Formal, Concise" },
    { label: "Expert, Analytical", value: "Expert, Analytical" },
    { label: "Casual, Empathetic", value: "Casual, Empathetic" },
  ];

  // Options for dropdowns
  const customerOptions: DropdownOption[] = [
    { label: "IT Professionals", value: "IT Professionals" },
    { label: "Doctors", value: "Doctors" },
    { label: "Students", value: "Students" },
    { label: "Lawyers", value: "Lawyers" },
    { label: "Entrepreneurs", value: "Entrepreneurs" },
    { label: "Startups", value: "Startups" },
    { label: "SMBs", value: "SMBs" },
    { label: "Enterprises", value: "Enterprises" },
    { label: "Marketers", value: "Marketers" },
    { label: "Sales Teams", value: "Sales Teams" },
    { label: "HR/Recruiters", value: "HR/Recruiters" },
    { label: "Teachers", value: "Teachers" },
    { label: "Researchers", value: "Researchers" },
    { label: "Designers", value: "Designers" },
    { label: "Product Managers", value: "Product Managers" },
    { label: "Developers", value: "Developers" },
    { label: "Accountants", value: "Accountants" },
    { label: "CXOs", value: "CXOs" },
    { label: "Support Teams", value: "Support Teams" },
    { label: "Operations", value: "Operations" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Bankers", value: "Bankers" },
    { label: "Investors", value: "Investors" },
    { label: "Freelancers", value: "Freelancers" },
    { label: "Consultants", value: "Consultants" },
    { label: "Other", value: "Other" },
  ];
  
  const ageOptions: DropdownOption[] = [
    { label: "Below 18", value: "Below 18" },
    { label: "18-25", value: "18-25" },
    { label: "26-40", value: "26-40" },
    { label: "40-55", value: "40-55" },
    { label: "55+", value: "55+" },
    { label: "Other", value: "Other" },
  ];

  // Handle checkbox changes
  const handleCheckboxChange = (field: keyof FormData, value: string): void => {
    const currentValues: string[] = (formData[field] as string[]) || [];
    const newValues: string[] = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    
    handleChange(field, newValues);
  };

  // Simple checkbox component
  const SimpleCheckbox: React.FC<{ value: boolean; onValueChange: () => void; color?: string }> = ({ value, onValueChange, color }) => (
    <TouchableOpacity
      style={[styles.checkbox, value && { backgroundColor: color || '#6366F1' }]}
      onPress={onValueChange}
    >
      {value && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  useEffect(() => {
    if (instructionOptions && instructionOptions.trim()) {
      setEditableSuggestion(instructionOptions);
      setShowModal(true);
    }
  }, [instructionOptions]);

  const handleRegenerate = () => {
    fetchInstructions();
  };

  const handleAccept = () => {
    handleChange("instructions", editableSuggestion);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputBlur = (field: keyof FormData) => {
    // Optional
  };

  return (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.title}>Step 3 - Audience & Configuration</Text>

      <Text style={styles.label}>Target Customers *</Text>
      <MultiSelect
        style={[styles.dropdown, errors.targetCustomers && styles.errorInput]}
        placeholderStyle={[styles.placeholderStyle, errors.targetCustomers && styles.errorText]}
        selectedTextStyle={[styles.selectedTextStyle, errors.targetCustomers && styles.errorText]}
        data={customerOptions}
        search
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder="Select target customers"
        searchPlaceholder="Search customers..."
        value={formData.targetCustomers}
        onChange={(items) => handleChange("targetCustomers", items)}
        mode="modal"
        onBlur={() => handleInputBlur("targetCustomers")}
      />
      {errors.targetCustomers && <Text style={styles.errorMessage}>{errors.targetCustomers}</Text>}
      
      {/* Display selected customers */}
      <View style={styles.selectedItemsContainer}>
        {formData.targetCustomers?.map((value: string, index: number) => {
          const label: string | undefined = customerOptions.find((opt: DropdownOption) => opt.value === value)?.label;
          return (
            <View key={index} style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{label}</Text>
              <TouchableOpacity
                onPress={() => {
                  const newValues: string[] = formData.targetCustomers.filter((v: string) => v !== value);
                  handleChange("targetCustomers", newValues);
                }}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <Text style={styles.label}>Target Audience Age Limit *</Text>
      <MultiSelect
        style={[styles.dropdown, errors.targetAgeLimit && styles.errorInput]}
        placeholderStyle={[styles.placeholderStyle, errors.targetAgeLimit && styles.errorText]}
        selectedTextStyle={[styles.selectedTextStyle, errors.targetAgeLimit && styles.errorText]}
        data={ageOptions}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder="Select age ranges"
        value={formData.targetAgeLimit}
        onChange={(items) => handleChange("targetAgeLimit", items)}
        mode="modal"
        onBlur={() => handleInputBlur("targetAgeLimit")}
      />
      {errors.targetAgeLimit && <Text style={styles.errorMessage}>{errors.targetAgeLimit}</Text>}
      
      {/* Display selected age ranges */}
      <View style={styles.selectedItemsContainer}>
        {formData.targetAgeLimit?.map((value: string, index: number) => {
          const label: string | undefined = ageOptions.find((opt: DropdownOption) => opt.value === value)?.label;
          return (
            <View key={index} style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{label}</Text>
              <TouchableOpacity
                onPress={() => {
                  const newValues: string[] = formData.targetAgeLimit.filter((v: string) => v !== value);
                  handleChange("targetAgeLimit", newValues);
                }}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity> 
            </View>
          );
        })}
      </View>

      <Text style={styles.label}>Target Audience Gender *</Text>
      <View style={[styles.checkboxContainer, errors.targetGender && styles.errorContainer]}>
        <View style={styles.checkboxRow}>
          <SimpleCheckbox
            value={formData.targetGender?.includes("male") || false}
            onValueChange={() => handleCheckboxChange("targetGender", "male")}
            color="#6366F1"
          />
          <Text style={styles.checkboxLabel}>Male</Text>
        </View>
        <View style={styles.checkboxRow}>
          <SimpleCheckbox
            value={formData.targetGender?.includes("female") || false}
            onValueChange={() => handleCheckboxChange("targetGender", "female")}
            color="#6366F1"
          />
          <Text style={styles.checkboxLabel}>Female</Text>
        </View>
        <View style={styles.checkboxRow}>
          <SimpleCheckbox
            value={formData.targetGender?.includes("other") || false}
            onValueChange={() => handleCheckboxChange("targetGender", "other")}
            color="#6366F1"
          />
          <Text style={styles.checkboxLabel}>Other</Text>
        </View>
      </View>
      {errors.targetGender && <Text style={styles.errorMessage}>{errors.targetGender}</Text>}

      <Text style={styles.label}>Conversation Tone *</Text>
      <Dropdown
        style={[styles.dropdown, errors.conversationTone && styles.errorInput]}
        placeholderStyle={[styles.placeholderStyle, errors.conversationTone && styles.errorText]}
        selectedTextStyle={[styles.selectedTextStyle, errors.conversationTone && styles.errorText]}
        data={conversationToneOptions}
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder="Select conversation tone"
        value={formData.conversationTone}
        onChange={(item) => handleChange("conversationTone", item.value)}
        mode="modal"
        onBlur={() => handleInputBlur("conversationTone")}
      />
      {errors.conversationTone && <Text style={styles.errorMessage}>{errors.conversationTone}</Text>}

      <Text style={styles.label}>Instructions</Text>
      <TextInput
        style={[styles.input, { height: 150, textAlignVertical: "top" }]}
        placeholderTextColor="#94A3B8"
        value={formData.instructions}
        onChangeText={(val: string) => handleChange("instructions", val)}
        placeholder="Enter your own instructions or use suggestion below"
        multiline
        accessible={true}
        accessibilityLabel="Instructions"
      />

      <TouchableOpacity
        style={[styles.button, (isLoading || !formData.description) && styles.buttonDisabled]}
        onPress={fetchInstructions}
        disabled={isLoading || !formData.description}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get Instruction Suggestions</Text>
        )}
      </TouchableOpacity>

      {/* Modal for Suggestions */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Instruction Suggestion</Text>
            <TextInput
              style={[styles.input, styles.modalInput]}
              multiline
              value={editableSuggestion}
              onChangeText={setEditableSuggestion}
              placeholder="Edit the suggestion here..."
              textAlignVertical="top"
              editable={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={handleRegenerate}
                disabled={isLoading}
              >
                <Text style={styles.regenerateButtonText}>
                  {isLoading ? "Regenerating..." : "Regenerate"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAccept}
                disabled={isLoading}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 20, color: "#1F2937" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12, color: "#374151" },
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
    color: "#333",
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
  },
  selectedItemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedItemText: {
    fontSize: 14,
    color: "#374151",
    marginRight: 6,
  },
  removeButton: {
    backgroundColor: "#9CA3AF",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    lineHeight: 16,
  },
  button: {
    backgroundColor: "#6366F1",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalInput: {
    height: 200,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  regenerateButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  regenerateButtonText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 16,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginBottom: 8,
  },
});

export default Step3;