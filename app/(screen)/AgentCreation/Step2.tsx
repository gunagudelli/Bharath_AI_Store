import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { RadioButton } from "react-native-paper";

// Interface for dropdown items
interface DropdownItem {
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
  business_idea: string;
  Domain_Sector: string;
  customDomain_Sector?: string;
  SubDomain_Subsector: string;
  customSubDomain_Subsector?: string;
  gptModel: string;
  isSolvingProblem?: string;
}

// Interface for Step2 props
interface Step2Props {
  formData: FormData;
  handleChange: (field: keyof FormData, value: any) => void;
}

const Step2: React.FC<Step2Props> = ({ formData, handleChange }) => {
  const [descriptionLength, setDescriptionLength] = useState<number>(
    formData.business_idea?.length || 0
  );

  // Simple dropdown component
  const SimpleDropdown: React.FC<{
    data: DropdownItem[];
    value: string;
    onSelect: (item: DropdownItem) => void;
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
  const [isOtherSectorSelected, setIsOtherSectorSelected] = useState<boolean>(false);
  const [isOtherSubSectorSelected, setIsOtherSubSectorSelected] = useState<boolean>(false);

  const [Sectors, setSectors] = useState<DropdownItem[]>([
    { label: "Law", value: "Law" },
    { label: "Finance", value: "Finance" },
    { label: "Healthcare", value: "Healthcare" },
    { label: "Taxation", value: "Taxation" },
    { label: "Education", value: "Education" },
    { label: "Technology", value: "Technology" },
    { label: "Marketing", value: "Marketing" },
    { label: "Human Resources", value: "Human Resources" },
    { label: "Operations", value: "Operations" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Retail", value: "Retail" },
    { label: "Other", value: "Other" },
  ]);

  const [subSectors, setSubSectors] = useState<DropdownItem[]>([
    { label: "Civil Law", value: "Civil Law" },
    { label: "Corporate Law", value: "Corporate Law" },
    { label: "GST", value: "GST" },
    { label: "Personal Finance", value: "Personal Finance" },
    { label: "Data Analytics", value: "Data Analytics" },
    { label: "Software Development", value: "Software Development" },
    { label: "Digital Marketing", value: "Digital Marketing" },
    { label: "Recruitment", value: "Recruitment" },
    { label: "Supply Chain", value: "Supply Chain" },
    { label: "Customer Support", value: "Customer Support" },
    { label: "Other", value: "Other" },
  ]);

  const [responseFormatOptions, setResponseFormatOptions] = useState<DropdownItem[]>([
    { label: "auto", value: "auto" },
    { label: "json_object", value: "json_object" },
  ]);

  const gptModles: DropdownItem[] = [{ label: "GPT-4o", value: "gpt-4o" }];

  const handleDescriptionChange = (text: string): void => {
    if (text.length <= 300) {
      handleChange("business_idea", text);
      setDescriptionLength(text.length);
    }
  };

  const handleSectorChange = (item: DropdownItem): void => {
    console.log("Selected domain:", item);
    handleChange("Domain_Sector", item.value);
  };

  const handleSubSectorChange = (item: DropdownItem): void => {
    console.log("Selected domain:", item);
    handleChange("SubDomain_Subsector", item.value);
  };

  const handlegptModelChange = (item: DropdownItem): void => {
    console.log("Selected Gpt:", item);
    handleChange("gptModel", item.value);
  };

  useEffect(() => {
    // Add custom Domain_Sector if it exists and isn't in predefined sectors
    if (
      formData.Domain_Sector &&
      formData.Domain_Sector !== "Other" &&
      !Sectors.some((sector: DropdownItem) => sector.value === formData.Domain_Sector)
    ) {
      setSectors((prev) => [
        ...prev.filter((sector: DropdownItem) => sector.value !== formData.Domain_Sector), // Avoid duplicates
        { label: formData.Domain_Sector, value: formData.Domain_Sector },
      ]);
    }

    // Add custom SubDomain_Subsector if it exists and isn't in predefined subSectors
    if (
      formData.SubDomain_Subsector &&
      formData.SubDomain_Subsector !== "Other" &&
      !subSectors.some((subSector: DropdownItem) => subSector.value === formData.SubDomain_Subsector)
    ) {
      setSubSectors((prev) => [
        ...prev.filter((subSector: DropdownItem) => subSector.value !== formData.SubDomain_Subsector), // Avoid duplicates
        {
          label: formData.SubDomain_Subsector,
          value: formData.SubDomain_Subsector,
        },
      ]);
    }

    // Set "Other" selection state based on stored values
    setIsOtherSectorSelected(formData.Domain_Sector === "Other");
    setIsOtherSubSectorSelected(formData.SubDomain_Subsector === "Other");
  }, [formData.Domain_Sector, formData.SubDomain_Subsector]);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Business Context & GPT Model</Text>

      <Text style={styles.label}>Business/Idea *</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        placeholder="Firm/Brand/Practice"
        placeholderTextColor="#94A3B8"
        value={formData.business_idea}
        onChangeText={handleDescriptionChange}
        multiline
        maxLength={300}
        accessible={true}
        accessibilityLabel="business_idea"
      />
      <View style={styles.charCounterContainer}>
        <Text style={styles.charCounter}>{descriptionLength}/300</Text>
        {descriptionLength >= 300 && (
          <Text style={styles.charLimitWarning}>
            Maximum characters reached
          </Text>
        )}
      </View>

      <Text style={styles.label}>Domain/Sector *</Text>
      <SimpleDropdown
        data={Sectors}
        value={formData.Domain_Sector}
        placeholder="Select a domain"
        onSelect={handleSectorChange}
      />
      {formData.Domain_Sector === "Other" && (
        <TextInput
          style={styles.input}
          placeholder="Enter custom dector/Domain"
          placeholderTextColor="#94A3B8"
          value={formData.customDomain_Sector || ""}
          onChangeText={(v: string) => handleChange("customDomain_Sector", v)}
          accessible={true}
          accessibilityLabel="customDomain_Sector"
        />
      )}

      <Text style={styles.label}>Sub-Domain/Subsector *</Text>
      <SimpleDropdown
        data={subSectors}
        value={formData.SubDomain_Subsector}
        placeholder="Select a sub-domain"
        onSelect={handleSubSectorChange}
      />
      {formData.SubDomain_Subsector === "Other" && (
        <TextInput
          style={styles.input}
          placeholder="Enter custom sub-Sector/sub-Domain"
          placeholderTextColor="#94A3B8"
          value={formData.customSubDomain_Subsector || ""}
          onChangeText={(v: string) => handleChange("customSubDomain_Subsector", v)}
          accessible={true}
          accessibilityLabel="customSubDomain_Subsector"
        />
      )}

      <Text style={styles.label}>GPT Model *</Text>
      <SimpleDropdown
        data={gptModles}
        value={formData.gptModel}
        placeholder="Select a GPT Model"
        onSelect={handlegptModelChange}
      />

      <Text style={styles.label}>Response Format *</Text>
      <SimpleDropdown
        data={responseFormatOptions}
        value={formData.responseFormat}
        placeholder="Select response format"
        onSelect={(item: DropdownItem) => handleChange("responseFormat", item.value)}
      />

      <View style={styles.radioContainer}>
        <Text style={styles.label}>Are you solving a problem? *</Text>
        <View style={styles.radioGroup}>
          <View style={styles.radioItem}>
            <RadioButton
              value="yes"
              status={
                formData.isSolvingProblem === "yes" ? "checked" : "unchecked"
              }
              onPress={() => handleChange("isSolvingProblem", "yes")} // Update formData
              color="#1E40AF"
              uncheckedColor="#6B7280"
            />
            <Text>Yes</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton
              value="no"
              status={
                formData.isSolvingProblem === "no" ? "checked" : "unchecked"
              }
              onPress={() => handleChange("isSolvingProblem", "no")} // Update formData
              color="#1E40AF"
              uncheckedColor="#6B7280"
            />
            <Text>No</Text>
          </View>
        </View>
      </View>

      {formData.isSolvingProblem === "yes" ? (
        <>
          <Text style={styles.label}>Main Problem to Solve * (max 100 chars)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g.,Early Stage Startups struggle to choose the right structure and miss deadlines."
            placeholderTextColor="#94A3B8"
            value={formData.mainProblemSolved}
            onChangeText={(v: string) => handleChange("mainProblemSolved", v)}
            accessible={true}
            multiline={true}
            maxLength={100}
            accessibilityLabel="Main Problem"
          />
        </>
      ) : null}

      <Text style={styles.label}>Unique Solution Method (max 100 chars)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g.,Fast Triage + templates + complaince checklist with remainders."
        placeholderTextColor="#94A3B8"
        value={formData.uniqueSolution}
        onChangeText={(v: string) => handleChange("uniqueSolution", v)}
        accessible={true}
        multiline={true}
        maxLength={100}
        accessibilityLabel="Unique Solution"
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
  charCounterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: -8,
    marginBottom: 12,
  },
  charCounter: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  charLimitWarning: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
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
  radioContainer: { // Renamed from 'container' to avoid confusion with stepContainer
    marginBottom: 15,
    width: "100%",
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});

export default Step2;