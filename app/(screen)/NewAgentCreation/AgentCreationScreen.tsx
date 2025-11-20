
// import { useNavigation } from "@react-navigation/native";
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import axios, { AxiosResponse } from "axios";
// import { router, useLocalSearchParams } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Modal,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { useSelector } from "react-redux";
// import BASE_URL from "../../../config";
// import { RootState } from "../../Redux/store";

// const { agentData } = useLocalSearchParams();

// const { width } = Dimensions.get("window");
// const MIN_DESC = 25;
// const MAX_DESC = 350;

// // Types
// type ViewType = "Public" | "Private";

// interface Option {
//   label: string;
//   value: string;
// }

// interface AgentData {
//   agentName: string;
//   description: string;
//   roleSelect: string;
//   goalSelect: string;
//   purposeSelect: string;
//   roleOther: string;
//   goalOther: string;
//   purposeOther: string;
//   view: ViewType;
//   instructions: string;
//   conStarter1: string;
//   conStarter2: string;
// }

// type RootStackParamList = {
//   Creation: undefined;
//   Preview: { agentData: AgentData };
//   Upload: { agentData: AgentData };
// };

// // Custom Hook for Debounce
// function useDebounced<T>(value: T, delay = 600): T {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return debounced;
// }

// // Options Data
// const ROLE_OPTS: Option[] = [
//   { label: "Student", value: "Student" },
//   { label: "Fresher", value: "Fresher" },
//   { label: "Job Seeker", value: "JobSeeker" },
//   { label: "Working Professional", value: "WorkingProfessional" },
//   { label: "Founder / Startup", value: "FounderStartup" },
//   { label: "CEO", value: "CEO" },
//   { label: "Business Owner", value: "BusinessOwner" },
//   { label: "Salesperson", value: "Salesperson" },
//   { label: "Market", value: "Market" },
//   { label: "Doctor", value: "Doctor" },
//   { label: "Chartered Accountant", value: "CharteredAccountant" },
//   { label: "Company Secretary", value: "CompanySecretary" },
//   { label: "Lawyer", value: "Lawyer" },
//   { label: "Real Estate", value: "RealEstate" },
//   { label: "Consultant", value: "Consultant" },
//   { label: "Developer", value: "Developer" },
//   { label: "Tester", value: "Tester" },
//   { label: "Manager", value: "Manager" },
//   { label: "Customer", value: "Customer" },
//   { label: "Other", value: "Other" },
// ];

// const GOAL_OPTS: Option[] = [
//   { label: "Job / Internship", value: "JobInternship" },
//   { label: "Upskilling", value: "Upskilling" },
//   { label: "Clients", value: "Clients" },
//   { label: "Leads", value: "Leads" },
//   { label: "Investors", value: "Investors" },
//   { label: "Funding", value: "Funding" },
//   { label: "Recruiting", value: "Recruiting" },
//   { label: "Hiring", value: "Hiring" },
//   { label: "Sales", value: "Sales" },
//   { label: "Revenue", value: "Revenue" },
//   { label: "Brand Visibility", value: "BrandVisibility" },
//   { label: "Growth", value: "Growth" },
//   { label: "Community Network", value: "CommunityNetwork" },
//   { label: "Automation", value: "Automation" },
//   { label: "AI Tools", value: "AITools" },
//   { label: "Projects", value: "Projects" },
//   { label: "Collaboration", value: "Collaboration" },
//   { label: "Support", value: "Support" },
//   { label: "Helpdesk", value: "Helpdesk" },
//   { label: "Other", value: "Other" },
// ];

// const PURPOSE_OPTS: Option[] = [
//   { label: "Learn", value: "Learn" },
//   { label: "Build", value: "Build" },
//   { label: "Offer", value: "Offer" },
//   { label: "Earn", value: "Earn" },
//   { label: "Hire", value: "Hire" },
//   { label: "Automate", value: "Automate" },
//   { label: "Market", value: "Market" },
//   { label: "Support", value: "Support" },
//   { label: "Legal Help", value: "LegalHelp" },
//   { label: "Medical Help", value: "MedicalHelp" },
//   { label: "Company Setup", value: "CompanySetup" },
//   { label: "Company Audit", value: "CompanyAudit" },
//   { label: "Other", value: "Other" },
// ];

// // Custom Select Component
// const CustomSelect: React.FC<{
//   value: string;
//   onChange: (value: string) => void;
//   options: Option[];
//   placeholder: string;
// }> = ({ value, onChange, options, placeholder }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const selectedOption = options.find((opt) => opt.value === value);

//   return (
//     <View style={styles.selectContainer}>
//       <TouchableOpacity
//         style={styles.selectButton}
//         onPress={() => setIsOpen(true)}
//       >
//         <Text style={value ? styles.selectText : styles.selectPlaceholder}>
//           {selectedOption ? selectedOption.label : placeholder}
//         </Text>
//         <Text style={styles.selectArrow}>▼</Text>
//       </TouchableOpacity>

//       <Modal visible={isOpen} transparent animationType="slide">
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setIsOpen(false)}
//         >
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{placeholder}</Text>
//               <TouchableOpacity onPress={() => setIsOpen(false)}>
//                 <Text style={styles.modalClose}>✕</Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.optionsScroll}>
//               {options.map((option) => (
//                 <TouchableOpacity
//                   key={option.value}
//                   style={[
//                     styles.optionItem,
//                     value === option.value && styles.optionItemSelected,
//                   ]}
//                   onPress={() => {
//                     onChange(option.value);
//                     setIsOpen(false);
//                   }}
//                 >
//                   <Text
//                     style={[
//                       styles.optionText,
//                       value === option.value && styles.optionTextSelected,
//                     ]}
//                   >
//                     {option.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// };

// // Agent Creation Screen
// const AgentCreationScreen: React.FC = () => {
//   const navigation =
//     useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   // Redux selectors
//   const userData = useSelector((state: RootState) => state.userData);
//   const token = userData?.accessToken;
//   const userId = userData?.userId;

//   const [roleSelect, setRoleSelect] = useState("");
//   const [goalSelect, setGoalSelect] = useState("");
//   const [purposeSelect, setPurposeSelect] = useState("");
//   const [roleOther, setRoleOther] = useState("");
//   const [goalOther, setGoalOther] = useState("");
//   const [purposeOther, setPurposeOther] = useState("");
//   const [agentName, setAgentName] = useState("");
//   const [description, setDescription] = useState("");
//   const [view, setView] = useState<ViewType>("Private");
//   const [nameLoading, setNameLoading] = useState(false);
//   const [descSuggestLoading, setDescSuggestLoading] = useState(false);

//   const roleResolved = roleSelect === "Other" ? roleOther.trim() : roleSelect;
//   const goalResolved = goalSelect === "Other" ? goalOther.trim() : goalSelect;
//   const purposeResolved =
//     purposeSelect === "Other" ? purposeOther.trim() : purposeSelect;

//   const roleDeb = useDebounced(roleResolved, 700);
//   const goalDeb = useDebounced(goalResolved, 700);
//   const purposeDeb = useDebounced(purposeResolved, 700);

//   const descCount = description.trim().length;
//   const canPreview =
//     agentName.trim().length >= 3 &&
//     !!roleResolved &&
//     !!goalResolved &&
//     !!purposeResolved &&
//     descCount >= MIN_DESC &&
//     descCount <= MAX_DESC;

//   const suggestAgentName = async () => {
//     if (!roleResolved || !goalResolved || !purposeResolved) {
//       Alert.alert("Missing Info", "Pick Role, Goal, and Purpose first.");
//       return;
//     }

//     if (!token) {
//       Alert.alert("Error", "Authentication token not found");
//       return;
//     }

//     setNameLoading(true);
//     try {
//       const response: AxiosResponse = await axios({
//         url: `${BASE_URL}ai-service/agent/getAgentName`,
//         method: "post",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         params: {
//           role: roleResolved,
//           goal: goalResolved,
//           purpose: purposeResolved,
//         },
//       });

//       const data = response.data;

//       let suggestion =
//         typeof data === "string" ? data : data.name || data.agentName || "";

//       // Trim "Generated Agent name:" or "✅ Generated Agent Name:" prefix if present
//       if (suggestion && typeof suggestion === "string") {
//         suggestion = suggestion
//           .replace(/^✅\s*Generated Agent Name:\s*/i, "")
//           .replace(/^Generated Agent name:\s*/i, "")
//           .trim();
//       }

//       if (suggestion) {
//        Alert.alert(
//   "AI Suggested Agent Name",
// `Suggested name: "${suggestion}". Use it or type your own.`,
//   [
//     { text: "Cancel", style: "cancel" },
//     { text: "Use", onPress: () => setAgentName(suggestion) },
//   ]
// );
//       }
//     } catch (error) {
//       console.error("Failed to generate name:", error);
//       Alert.alert("Error", "Failed to generate name");
//     } finally {
//       setNameLoading(false);
//     }
//   };

//   const suggestDescription = async () => {
//     if (!roleResolved || !goalResolved || !purposeResolved) {
//       Alert.alert("Missing Info", "Pick Role, Goal, and Purpose first.");
//       return;
//     }

//     if (!token) {
//       Alert.alert("Error", "Authentication token not found");
//       return;
//     }

//     setDescSuggestLoading(true);
//     try {
//       const response: AxiosResponse = await axios({
//         url: `${BASE_URL}ai-service/agent/getAgentDescription`,
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         params: {
//           role: roleResolved,
//           goal: goalResolved,
//           purpose: purposeResolved,
//         },
//       });

//       const data = response.data;
//       const suggestion =
//         typeof data === "string" ? data : data.description || "";

//      if (suggestion) {
//   Alert.alert(
//     "AI Suggested Description",
//     suggestion, // show full suggestion here
//     [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Use",
//         onPress: () => setDescription(suggestion.slice(0, MAX_DESC)), // still respect max length
//       },
//     ]
//   );
// }

//     } catch (error) {
//       console.error("Failed to generate description:", error);
//       Alert.alert("Error", "Failed to generate description");
//     } finally {
//       setDescSuggestLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!roleDeb || !goalDeb || !purposeDeb) return;
//     suggestAgentName();
//   }, [roleDeb, goalDeb, purposeDeb]);

//   const handlePreview = () => {
//     if (!canPreview) {
//       Alert.alert("Incomplete", "Please complete all required fields.");
//       return;
//     }

//     const agentData = {
//       agentName,
//       description,
//       roleSelect,
//       goalSelect,
//       purposeSelect,
//       roleOther,
//       goalOther,
//       purposeOther,
//       view,
//       instructions: "",
//       conStarter1: "",
//       conStarter2: "",
//     };

//     router.push({
//       pathname: "/(screen)/NewAgentCreation/AgentPreviewScreen",
//       params: { agentData: JSON.stringify(agentData) },
//     });

//     console.log("Navigating to Preview with data:", agentData);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <Text style={styles.headerEmoji}>💼</Text>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.headerTitle}>Role-based Agent</Text>
//               <Text style={styles.headerSubtitle}>
//                 Choose a role (Student, CEO, Lawyer, etc.....). We auto-apply tone,
//                 goals, and defaults.
//               </Text>
//             </View>
//           </View>
//           <View style={styles.headerBadges}>
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>AI Powered</Text>
//             </View>
//             <View style={[styles.badge, styles.badgeFastest]}>
//               <Text style={styles.badgeTextFastest}>Fastest</Text>
//             </View>
//           </View>
//         </View>

//         {/* Role Selection Card */}
//         <View style={styles.card}>
//           <View style={styles.rowHorizontal}>
//             <Text style={styles.gradientLabel}>I am</Text>
//             <View style={styles.inputContainerRight}>
//               <CustomSelect
//                 value={roleSelect}
//                 onChange={setRoleSelect}
//                 options={ROLE_OPTS}
//                 placeholder="Select your role"
//               />
//               {roleSelect === "Other" && (
//                 <TextInput
//                   style={styles.otherInput}
//                   value={roleOther}
//                   onChangeText={setRoleOther}
//                   placeholder="Type your role…"
//                   placeholderTextColor="#94A3B8"
//                   maxLength={60}
//                 />
//               )}
//             </View>
//           </View>

//           <View style={styles.rowHorizontal}>
//             <Text style={[styles.gradientLabel, styles.gradientLabel2]}>
//               Looking for
//             </Text>
//             <View style={styles.inputContainerRight}>
//               <CustomSelect
//                 value={goalSelect}
//                 onChange={setGoalSelect}
//                 options={GOAL_OPTS}
//                 placeholder="Select your goal"
//               />
//               {goalSelect === "Other" && (
//                 <TextInput
//                   style={styles.otherInput}
//                   value={goalOther}
//                   onChangeText={setGoalOther}
//                   placeholder="Type your goal…"
//                   placeholderTextColor="#94A3B8"
//                   maxLength={60}
//                 />
//               )}
//             </View>
//           </View>

//           <View style={styles.rowHorizontal}>
//             <Text style={[styles.gradientLabel, styles.gradientLabel3]}>
//               To
//             </Text>
//             <View style={styles.inputContainerRight}>
//               <CustomSelect
//                 value={purposeSelect}
//                 onChange={setPurposeSelect}
//                 options={PURPOSE_OPTS}
//                 placeholder="Select purpose"
//               />
//               {purposeSelect === "Other" && (
//                 <TextInput
//                   style={styles.otherInput}
//                   value={purposeOther}
//                   onChangeText={setPurposeOther}
//                   placeholder="Type your purpose…"
//                   placeholderTextColor="#94A3B8"
//                   maxLength={60}
//                 />
//               )}
//             </View>
//           </View>
//         </View>

//         {/* Agent Name */}
//         <View style={styles.card}>
//           <View style={styles.sectionHeader}>
//             <View>
//               <Text style={styles.sectionTitle}>Agent Name</Text>
//               <Text style={styles.helperText}>Min 3 – 80 characters</Text>
//             </View>
//             <TouchableOpacity
//               style={[
//                 styles.suggestButton,
//                 (nameLoading ||
//                   !roleResolved ||
//                   !goalResolved ||
//                   !purposeResolved) &&
//                   styles.suggestButtonDisabled,
//               ]}
//               onPress={suggestAgentName}
//               disabled={
//                 nameLoading ||
//                 !roleResolved ||
//                 !goalResolved ||
//                 !purposeResolved
//               }
//             >
//               {nameLoading ? (
//                 <ActivityIndicator size="small" color="#6D28D9" />
//               ) : (
//                 <>
//                   <Text style={styles.suggestIcon}>💡</Text>
//                   <Text style={styles.suggestButtonText}>AI Suggested</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//           <TextInput
//             style={styles.input}
//             value={agentName}
//             onChangeText={setAgentName}
//             placeholder="Enter Your Agent Name"
//             placeholderTextColor="#94A3B8"
//             maxLength={80}
//           />
//         </View>

//         {/* Description */}
//         <View style={styles.card}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Agent Description</Text>
//             <TouchableOpacity
//               style={[
//                 styles.suggestButton,
//                 (descSuggestLoading ||
//                   !roleResolved ||
//                   !goalResolved ||
//                   !purposeResolved) &&
//                   styles.suggestButtonDisabled,
//               ]}
//               onPress={suggestDescription}
//               disabled={
//                 descSuggestLoading ||
//                 !roleResolved ||
//                 !goalResolved ||
//                 !purposeResolved
//               }
//             >
//               {descSuggestLoading ? (
//                 <ActivityIndicator size="small" color="#6D28D9" />
//               ) : (
//                 <>
//                   <Text style={styles.suggestIcon}>💡</Text>
//                   <Text style={styles.suggestButtonText}>AI Suggested</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//           <TextInput
//             style={styles.textArea}
//             value={description}
//             onChangeText={setDescription}
//             placeholder="Tell what this agent does in your own words…"
//             placeholderTextColor="#94A3B8"
//             multiline
//             maxLength={MAX_DESC}
//           />
//           <View style={styles.counterRow}>
//             <Text style={styles.helperText}>
//               Keep it between {MIN_DESC}–{MAX_DESC} characters
//             </Text>
//             <Text
//               style={[
//                 styles.counter,
//                 descCount > MAX_DESC - 20 && styles.counterWarning,
//               ]}
//             >
//               {descCount}/{MAX_DESC}
//             </Text>
//           </View>
//         </View>

//         {/* Visibility */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Visibility:</Text>
//           <View style={styles.visibilityRow}>
//             <TouchableOpacity
//               style={[
//                 styles.visibilityButton,
//                 view === "Private" && styles.visibilityButtonActive,
//               ]}
//               onPress={() => setView("Private")}
//             >
//               <Text
//                 style={[
//                   styles.visibilityText,
//                   view === "Private" && styles.visibilityTextActive,
//                 ]}
//               >
//                 Personal
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.visibilityButton,
//                 view === "Public" && styles.visibilityButtonActive,
//               ]}
//               onPress={() => setView("Public")}
//             >
//               <Text
//                 style={[
//                   styles.visibilityText,
//                   view === "Public" && styles.visibilityTextActive,
//                 ]}
//               >
//                 Public
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Actions */}
//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.previewButton, !canPreview && styles.buttonDisabled]}
//             onPress={handlePreview}
//             disabled={!canPreview}
//           >
//             <Text style={styles.previewButtonText}>Preview</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//   },

//   // Header Styles - Updated
//   header: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     padding: 18,
//     marginTop: 20,
//     marginBottom: 14,
//     shadowColor: "#6D28D9",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.08,
//     shadowRadius: 18,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: "#E7E6F3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },
//   headerLeft: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 12,
//   },
//   headerEmoji: {
//     fontSize: 32,
//     marginTop: 4,
//   },
//   headerTextContainer: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "900",
//     color: "#0F172A",
//     marginBottom: 6,
//   },
//   headerSubtitle: {
//     fontSize: 13,
//     color: "#64748B",
//     lineHeight: 18,
//   },
//   headerBadges: {
//     gap: 8,
//     alignItems: "flex-end",
//   },
//   badge: {
//     backgroundColor: "#6D28D9",
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 999,
//     shadowColor: "#6D28D9",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   badgeText: {
//     color: "#FFFFFF",
//     fontSize: 11,
//     fontWeight: "700",
//   },
//   badgeFastest: {
//     backgroundColor: "#FCD34D",
//   },
//   badgeTextFastest: {
//     color: "#3B0764",
//     fontSize: 11,
//     fontWeight: "700",
//   },

//   // Card Styles
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 14,
//     shadowColor: "#020817",
//     shadowOffset: { width: 0, height: 14 },
//     shadowOpacity: 0.08,
//     shadowRadius: 40,
//     elevation: 5,
//     borderWidth: 1,
//     borderColor: "#E7E6F3",
//   },

//   // Row Styles - Updated for horizontal layout
//   rowHorizontal: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 14,
//     gap: 12,
//   },
//   gradientLabel: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: "#6D28D9",
//     letterSpacing: 0.2,
//     minWidth: 100,
//     paddingTop: 12,
//   },
//   gradientLabel2: {
//     color: "#2563EB",
//   },
//   gradientLabel3: {
//     color: "#06bd67",
//   },

//   // Input Container - Updated
//   inputContainerRight: {
//     flex: 1,
//   },

//   // Select Styles
//   selectContainer: {
//     position: "relative",
//     zIndex: 1,
//   },
//   selectButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#6D28D9",
//     backgroundColor: "#FFFFFF",
//     shadowColor: "#020817",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.06,
//     shadowRadius: 18,
//     elevation: 3,
//   },
//   selectText: {
//     fontSize: 15,
//     color: "#111827",
//     fontWeight: "600",
//     flex: 1,
//   },
//   selectPlaceholder: {
//     fontSize: 15,
//     color: "#94A3B8",
//     flex: 1,
//   },
//   selectArrow: {
//     fontSize: 12,
//     color: "#94A3B8",
//     marginLeft: 8,
//   },

//   // Other Input
//   otherInput: {
//     marginTop: 8,
//     height: 44,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#E7E6F3",
//     backgroundColor: "#FFFFFF",
//     fontSize: 14,
//     color: "#111827",
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "70%",
//     paddingBottom: 20,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E7E6F3",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   modalClose: {
//     fontSize: 24,
//     color: "#64748B",
//     fontWeight: "600",
//   },
//   optionsScroll: {
//     maxHeight: 400,
//   },
//   optionItem: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E7E6F3",
//   },
//   optionItemSelected: {
//     backgroundColor: "#6D28D9",
//   },
//   optionText: {
//     fontSize: 15,
//     color: "#111827",
//     fontWeight: "500",
//   },
//   optionTextSelected: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//   },

//   // Section Header
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 12,
//     flexWrap: "wrap",
//     gap: 8,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: "#6D28D9",
//     letterSpacing: 0.2,
//   },

//   // Suggest Button
//   suggestButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: "#E7E6F3",
//     backgroundColor: "#FFFFFF",
//     gap: 6,
//   },
//   suggestButtonDisabled: {
//     opacity: 0.6,
//   },
//   suggestIcon: {
//     fontSize: 16,
//   },
//   suggestButtonText: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: "#0F172A",
//   },

//   // Input Styles
//   input: {
//     height: 44,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E7E6F3",
//     backgroundColor: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#111827",
//     shadowColor: "#020817",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.04,
//     shadowRadius: 1,
//     elevation: 1,
//   },
//   textArea: {
//     minHeight: 100,
//     paddingHorizontal: 12,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E7E6F3",
//     backgroundColor: "#FFFFFF",
//     fontSize: 14,
//     color: "#111827",
//     textAlignVertical: "top",
//     shadowColor: "#020817",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.04,
//     shadowRadius: 1,
//     elevation: 1,
//   },

//   // Helper Text
//   helperText: {
//     fontSize: 12,
//     color: "#64748B",
//     marginTop: 6,
//   },

//   // Counter Row
//   counterRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   counter: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: "#0EA5E9",
//   },
//   counterWarning: {
//     color: "#F59E0B",
//   },

//   // Visibility Styles
//   visibilityRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 10,
//   },
//   visibilityButton: {
//     flex: 1,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: "#E7E6F3",
//     backgroundColor: "#FFFFFF",
//     alignItems: "center",
//   },
//   visibilityButtonActive: {
//     borderColor: "#6D28D9",
//     backgroundColor: "#F3E8FF",
//   },
//   visibilityText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#64748B",
//   },
//   visibilityTextActive: {
//     color: "#6D28D9",
//     fontWeight: "700",
//   },

//   // Actions
//   actions: {
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   previewButton: {
//     backgroundColor: "#6D28D9",
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     shadowColor: "#6D28D9",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   buttonDisabled: {
//     backgroundColor: "#CBD5E1",
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   previewButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
// });

// export default AgentCreationScreen;




import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios, { AxiosResponse } from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import BASE_URL from "../../../config";
import { RootState } from "../../Redux/store";

const MIN_DESC = 25;
const MAX_DESC = 350;

type ViewType = "Public" | "Private";

interface Option {
  label: string;
  value: string;
}

interface AgentData {
  agentName: string;
  description: string;
  roleSelect: string;
  goalSelect: string;
  purposeSelect: string;
  roleOther: string;
  goalOther: string;
  purposeOther: string;
  view: ViewType;
  instructions: string;
  conStarter1: string;
  conStarter2: string;
}

type RootStackParamList = {
  Creation: undefined;
  Preview: { agentData: AgentData };
  Upload: { agentData: AgentData };
};

function useDebounced<T>(value: T, delay = 600): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const ROLE_OPTS: Option[] = [
  { label: "Student", value: "Student" },
  { label: "Fresher", value: "Fresher" },
  { label: "Job Seeker", value: "JobSeeker" },
  { label: "Working Professional", value: "WorkingProfessional" },
  { label: "Founder / Startup", value: "FounderStartup" },
  { label: "CEO", value: "CEO" },
  { label: "Business Owner", value: "BusinessOwner" },
  { label: "Salesperson", value: "Salesperson" },
  { label: "Market", value: "Market" },
  { label: "Doctor", value: "Doctor" },
  { label: "Chartered Accountant", value: "CharteredAccountant" },
  { label: "Company Secretary", value: "CompanySecretary" },
  { label: "Lawyer", value: "Lawyer" },
  { label: "Real Estate", value: "RealEstate" },
  { label: "Consultant", value: "Consultant" },
  { label: "Developer", value: "Developer" },
  { label: "Tester", value: "Tester" },
  { label: "Manager", value: "Manager" },
  { label: "Customer", value: "Customer" },
  { label: "Other", value: "Other" },
];

const GOAL_OPTS: Option[] = [
  { label: "Job / Internship", value: "JobInternship" },
  { label: "Upskilling", value: "Upskilling" },
  { label: "Clients", value: "Clients" },
  { label: "Leads", value: "Leads" },
  { label: "Investors", value: "Investors" },
  { label: "Funding", value: "Funding" },
  { label: "Recruiting", value: "Recruiting" },
  { label: "Hiring", value: "Hiring" },
  { label: "Sales", value: "Sales" },
  { label: "Revenue", value: "Revenue" },
  { label: "Brand Visibility", value: "BrandVisibility" },
  { label: "Growth", value: "Growth" },
  { label: "Community Network", value: "CommunityNetwork" },
  { label: "Automation", value: "Automation" },
  { label: "AI Tools", value: "AITools" },
  { label: "Projects", value: "Projects" },
  { label: "Collaboration", value: "Collaboration" },
  { label: "Support", value: "Support" },
  { label: "Helpdesk", value: "Helpdesk" },
  { label: "Other", value: "Other" },
];

const PURPOSE_OPTS: Option[] = [
  { label: "Learn", value: "Learn" },
  { label: "Build", value: "Build" },
  { label: "Offer", value: "Offer" },
  { label: "Earn", value: "Earn" },
  { label: "Hire", value: "Hire" },
  { label: "Automate", value: "Automate" },
  { label: "Market", value: "Market" },
  { label: "Support", value: "Support" },
  { label: "Legal Help", value: "LegalHelp" },
  { label: "Medical Help", value: "MedicalHelp" },
  { label: "Company Setup", value: "CompanySetup" },
  { label: "Company Audit", value: "CompanyAudit" },
  { label: "Other", value: "Other" },
];

const CustomSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
}> = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={styles.selectContainer}>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={value ? styles.selectText : styles.selectPlaceholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.selectArrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsScroll}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Simplified Suggestion Popup - Only Use and Cancel buttons
const SuggestionPopup: React.FC<{
  visible: boolean;
  title: string;
  suggestion: string;
  onUse: () => void;
  onCancel: () => void;
}> = ({ visible, title, suggestion, onUse, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.suggestionOverlay}>
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>{title}</Text>
          <ScrollView style={styles.suggestionTextContainer}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </ScrollView>
          
          <View style={styles.suggestionButtons}>
            <TouchableOpacity
              style={[styles.suggestionButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.suggestionButton, styles.useButton]}
              onPress={onUse}
            >
              <Text style={styles.useButtonText}>Use</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AgentCreationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const userData = useSelector((state: RootState) => state.userData);
  const token = userData?.accessToken;

  const [roleSelect, setRoleSelect] = useState("");
  const [goalSelect, setGoalSelect] = useState("");
  const [purposeSelect, setPurposeSelect] = useState("");
  const [roleOther, setRoleOther] = useState("");
  const [goalOther, setGoalOther] = useState("");
  const [purposeOther, setPurposeOther] = useState("");
  const [agentName, setAgentName] = useState("");
  const [description, setDescription] = useState("");
  const [view, setView] = useState<ViewType>("Private");
  const [nameLoading, setNameLoading] = useState(false);
  const [descSuggestLoading, setDescSuggestLoading] = useState(false);

  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showDescPopup, setShowDescPopup] = useState(false);
  const [suggestedName, setSuggestedName] = useState("");
  const [suggestedDesc, setSuggestedDesc] = useState("");

  const roleResolved = roleSelect === "Other" ? roleOther.trim() : roleSelect;
  const goalResolved = goalSelect === "Other" ? goalOther.trim() : goalSelect;
  const purposeResolved =
    purposeSelect === "Other" ? purposeOther.trim() : purposeSelect;

  const roleDeb = useDebounced(roleResolved, 700);
  const goalDeb = useDebounced(goalResolved, 700);
  const purposeDeb = useDebounced(purposeResolved, 700);

  const descCount = description.trim().length;
  const canPreview =
    agentName.trim().length >= 3 &&
    !!roleResolved &&
    !!goalResolved &&
    !!purposeResolved &&
    descCount >= MIN_DESC &&
    descCount <= MAX_DESC;

  const suggestAgentName = async () => {
    if (!roleResolved || !goalResolved || !purposeResolved) {
      Alert.alert("Missing Info", "Pick Role, Goal, and Purpose first.");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Authentication token not found");
      return;
    }

    setNameLoading(true);
    try {
      const response: AxiosResponse = await axios({
        url: `${BASE_URL}ai-service/agent/getAgentName`,
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          role: roleResolved,
          goal: goalResolved,
          purpose: purposeResolved,
        },
      });

      const data = response.data;
      let suggestion =
        typeof data === "string" ? data : data.name || data.agentName || "";

      if (suggestion && typeof suggestion === "string") {
        suggestion = suggestion
          .replace(/^✅\s*Generated Agent Name:\s*/i, "")
          .replace(/^Generated Agent name:\s*/i, "")
          .trim();
      }

      if (suggestion) {
        setSuggestedName(suggestion);
        setShowNamePopup(true);
      }
    } catch (error) {
      console.error("Failed to generate name:", error);
      Alert.alert("Error", "Failed to generate name");
    } finally {
      setNameLoading(false);
    }
  };

  const suggestDescription = async () => {
    if (!roleResolved || !goalResolved || !purposeResolved) {
      Alert.alert("Missing Info", "Pick Role, Goal, and Purpose first.");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Authentication token not found");
      return;
    }

    setDescSuggestLoading(true);
    try {
      const response: AxiosResponse = await axios({
        url: `${BASE_URL}ai-service/agent/getAgentDescription`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          role: roleResolved,
          goal: goalResolved,
          purpose: purposeResolved,
        },
      });

      const data = response.data;
      let suggestion =
        typeof data === "string" ? data : data.description || "";

      // Clean up any formatting prefixes
      if (suggestion && typeof suggestion === "string") {
        suggestion = suggestion
          .replace(/^✅\s*Generated Description:\s*/i, "")
          .replace(/^Generated Description:\s*/i, "")
          .trim();
      }

      if (suggestion) {
        setSuggestedDesc(suggestion);
        setShowDescPopup(true);
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      Alert.alert("Error", "Failed to generate description");
    } finally {
      setDescSuggestLoading(false);
    }
  };

  // Auto-suggest name only when all three fields are filled
  useEffect(() => {
    if (!roleDeb || !goalDeb || !purposeDeb) return;
    suggestAgentName();
  }, [roleDeb, goalDeb, purposeDeb]);

  const handlePreview = () => {
    if (!canPreview) {
      Alert.alert("Incomplete", "Please complete all required fields.");
      return;
    }

    const agentData = {
      agentName,
      description,
      roleSelect,
      goalSelect,
      purposeSelect,
      roleOther,
      goalOther,
      purposeOther,
      view,
      instructions: "",
      conStarter1: "",
      conStarter2: "",
    };

    router.push({
      pathname: "/(screen)/NewAgentCreation/AgentPreviewScreen",
      params: { agentData: JSON.stringify(agentData) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                  <Text style={styles.headerEmoji}>💼</Text>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Role-based AI Agent</Text>
                    <Text style={styles.headerSubtitle}>
                      Choose a role. We auto-apply tone, goals, and defaults.
                    </Text>
                  </View>
                </View>
                <View style={styles.headerBadges}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>AI Powered</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeFastest]}>
                    <Text style={styles.badgeTextFastest}>Fastest</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Role Selection Card */}
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>I am</Text>
                <View style={styles.inputWrapper}>
                  <CustomSelect
                    value={roleSelect}
                    onChange={setRoleSelect}
                    options={ROLE_OPTS}
                    placeholder="Select your role"
                  />
                {roleSelect === "Other" && (
  <>
    <TextInput
      style={styles.otherInput}
      value={roleOther}
      onChangeText={setRoleOther}
      
      placeholder="Type your role…"
      placeholderTextColor="#94A3B8"
      maxLength={60}
    />
    {roleOther.length >= 60 && (
      <Text style={{ color: 'red', fontSize: 12 }}>
        Max limit is 60 characters
      </Text>
    )}
  </>
)}

                </View>
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, styles.labelBlue]}>
                  Looking for
                </Text>
                <View style={styles.inputWrapper}>
                  <CustomSelect
                    value={goalSelect}
                    onChange={setGoalSelect}
                    options={GOAL_OPTS}
                    placeholder="Select your goal"
                  />
                 {goalSelect === "Other" && (
  <>
    <TextInput
      style={styles.otherInput}
      value={goalOther}
      onChangeText={setGoalOther}
      placeholder="Type your goal…"
      placeholderTextColor="#94A3B8"
      maxLength={60}
    />
    {goalOther.length >= 60 && (
      <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
        Max limit is 60 characters
      </Text>
    )}
  </>
)}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, styles.labelGreen]}>To</Text>
                <View style={styles.inputWrapper}>
                  <CustomSelect
                    value={purposeSelect}
                    onChange={setPurposeSelect}
                    options={PURPOSE_OPTS}
                    placeholder="Select purpose"
                  />
                 {purposeSelect === "Other" && (
  <>
    <TextInput
      style={styles.otherInput}
      value={purposeOther}
      onChangeText={setPurposeOther}
      placeholder="Type your purpose…"
      placeholderTextColor="#94A3B8"
      maxLength={60}
    />
    {purposeOther.length >= 60 && (
      <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
        Max limit is 60 characters
      </Text>
    )}
  </>
)}
                </View>
              </View>
            </View>

            {/* Agent Name */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Agent Name</Text>
                  <Text style={styles.helperText}>Min 3 – 80 characters</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.suggestButton,
                    (nameLoading ||
                      !roleResolved ||
                      !goalResolved ||
                      !purposeResolved) &&
                      styles.suggestButtonDisabled,
                  ]}
                  onPress={suggestAgentName}
                  disabled={
                    nameLoading ||
                    !roleResolved ||
                    !goalResolved ||
                    !purposeResolved
                  }
                >
                  {nameLoading ? (
                    <ActivityIndicator size="small" color="#6D28D9" />
                  ) : (
                    <>
                      <Text style={styles.suggestIcon}>💡</Text>
                      <Text style={styles.suggestButtonText}>AI Suggest</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={agentName}
                onChangeText={setAgentName}
                placeholder="Enter Your Agent Name"
                placeholderTextColor="#94A3B8"
                maxLength={80}
              />
            </View>

            {/* Description */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Agent Description</Text>
                <TouchableOpacity
                  style={[
                    styles.suggestButton,
                    (descSuggestLoading ||
                      !roleResolved ||
                      !goalResolved ||
                      !purposeResolved) &&
                      styles.suggestButtonDisabled,
                  ]}
                  onPress={suggestDescription}
                  disabled={
                    descSuggestLoading ||
                    !roleResolved ||
                    !goalResolved ||
                    !purposeResolved
                  }
                >
                  {descSuggestLoading ? (
                    <ActivityIndicator size="small" color="#6D28D9" />
                  ) : (
                    <>
                      <Text style={styles.suggestIcon}>💡</Text>
                      <Text style={styles.suggestButtonText}>AI Suggest</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Tell what this agent does in your own words…"
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={MAX_DESC}
              />
              <View style={styles.counterRow}>
                <Text style={styles.helperText}>
                  Keep it between {MIN_DESC}–{MAX_DESC} characters
                </Text>
                <Text
                  style={[
                    styles.counter,
                    descCount > MAX_DESC - 20 && styles.counterWarning,
                  ]}
                >
                  {descCount}/{MAX_DESC}
                </Text>
              </View>
            </View>

            {/* Visibility */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Visibility</Text>
              <View style={styles.visibilityRow}>
                <TouchableOpacity
                  style={[
                    styles.visibilityButton,
                    view === "Private" && styles.visibilityButtonActive,
                  ]}
                  onPress={() => setView("Private")}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      view === "Private" && styles.visibilityTextActive,
                    ]}
                  >
                    Personal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.visibilityButton,
                    view === "Public" && styles.visibilityButtonActive,
                  ]}
                  onPress={() => setView("Public")}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      view === "Public" && styles.visibilityTextActive,
                    ]}
                  >
                    Public
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.previewButton,
                  !canPreview && styles.buttonDisabled,
                ]}
                onPress={handlePreview}
                disabled={!canPreview}
              >
                <Text style={styles.previewButtonText}>Preview</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Suggestion Popups - Only Use and Cancel */}
      <SuggestionPopup
        visible={showNamePopup}
        title="AI Suggested Agent Name"
        suggestion={suggestedName}
        onUse={() => {
          setAgentName(suggestedName);
          setShowNamePopup(false);
        }}
        onCancel={() => setShowNamePopup(false)}
      />

      <SuggestionPopup
        visible={showDescPopup}
        title="AI Suggested Description"
        suggestion={suggestedDesc}
        onUse={() => {
          setDescription(suggestedDesc.slice(0, MAX_DESC));
          setShowDescPopup(false);
        }}
        onCancel={() => setShowDescPopup(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },

  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  headerBadges: {
    gap: 6,
    alignItems: "flex-end",
  },
  badge: {
    backgroundColor: "#6D28D9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  badgeFastest: {
    backgroundColor: "#FCD34D",
  },
  badgeTextFastest: {
    color: "#78350F",
    fontSize: 10,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6D28D9",
    minWidth: 85,
    paddingTop: 12,
  },
  labelBlue: {
    color: "#2563EB",
  },
  labelGreen: {
    color: "#059669",
  },
  inputWrapper: {
    flex: 1,
  },

  selectContainer: {
    zIndex: 1,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  selectText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
    flex: 1,
  },
  selectPlaceholder: {
    fontSize: 14,
    color: "#94A3B8",
    flex: 1,
  },
  selectArrow: {
    fontSize: 10,
    color: "#94A3B8",
    marginLeft: 8,
  },
  otherInput: {
    marginTop: 8,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#0F172A",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalClose: {
    fontSize: 24,
    color: "#64748B",
  },
  optionsScroll: {
    maxHeight: 400,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  optionItemSelected: {
    backgroundColor: "#F3E8FF",
  },
  optionText: {
    fontSize: 15,
    color: "#0F172A",
  },
  optionTextSelected: {
    color: "#6D28D9",
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },

  suggestButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    gap: 4,
  },
  suggestButtonDisabled: {
    opacity: 0.5,
  },
  suggestIcon: {
    fontSize: 14,
  },
  suggestButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6D28D9",
  },

  input: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#0F172A",
    textAlignVertical: "top",
  },

  helperText: {
    fontSize: 12,
    color: "#64748B",
  },

  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  counter: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  counterWarning: {
    color: "#F59E0B",
  },

  visibilityRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  visibilityButtonActive: {
    borderColor: "#6D28D9",
    backgroundColor: "#F3E8FF",
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  visibilityTextActive: {
    color: "#6D28D9",
    fontWeight: "700",
  },

  actions: {
    marginTop: 8,
    marginBottom: 20,
  },
  previewButton: {
    backgroundColor: "#6D28D9",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  suggestionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  suggestionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  suggestionTextContainer: {
    maxHeight: 250,
    marginBottom: 20,
    paddingRight: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
  },
  suggestionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  suggestionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  useButton: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  useButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default AgentCreationScreen;