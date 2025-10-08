import React, { useState, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  FlatList,
  Platform,
  PermissionsAndroid,
} from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import * as Speech from "expo-speech"; // Optional TTS feedback
// import { Audio, AudioRecordingOptions } from "expo-av";

const { width: screenWidth } = Dimensions.get("window");

interface CustomButton {
  position: "left" | "right";
  icon: string;
  onPress: () => void;
  size?: number;
}

interface FileItem {
  id: string;
  name: string;
  uri: string;
}

interface ChatInputProps {
  placeholder?: string;
  onSendMessage?: (text: string, fileData?: any) => void;
  onFileUpload?: (file: any) => void;
  showAttachment?: boolean;
  showMic?: boolean;
  showSend?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  maxLength?: number;
  multiline?: boolean;
  enableVoice?: boolean;
  customButtons?: CustomButton[];
  theme?: "dark" | "light";
  navigation?: any;
}

interface Theme {
  container: string;
  input: string;
  text: string;
  placeholder: string;
  border: string;
  buttonInactive: string;
  buttonActive: string;
  sendActive: string;
  sendInactive: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = "Type your message...",
  onSendMessage,
  onFileUpload,
  showAttachment = true,
  showMic = true,
  showSend = true,
  containerStyle,
  inputStyle,
  maxLength = 1000,
  multiline = true,
  enableVoice = false,
  customButtons = [],
  theme = "dark",
  navigation,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileData, setFileData] = useState<any>(null);
//   const recordingRef = useRef<Audio.Recording | null>(null);

  const themes: Record<"dark" | "light", Theme> = {
    dark: {
      container: "#2d3748",
      input: "#4a5568",
      text: "#ffffff",
      placeholder: "#a0aec0",
      border: "#4a5568",
      buttonInactive: "#718096",
      buttonActive: "#3182ce",
      sendActive: "#3182ce",
      sendInactive: "#718096",
    },
    light: {
      container: "#f7fafc",
      input: "#ffffff",
      text: "#2d3748",
      placeholder: "#a0aec0",
      border: "#e2e8f0",
      buttonInactive: "#718096",
      buttonActive: "#3182ce",
      sendActive: "#3182ce",
      sendInactive: "#cbd5e0",
    },
  };

  const currentTheme: Theme = themes[theme as keyof typeof themes];

  // Request audio recording permission
//   const getPermission = async (): Promise<boolean> => {
//     try {
//       if (Platform.OS === "android") {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//           {
//             title: "Audio Recording Permission",
//             message: "App needs permission to record audio",
//             buttonNeutral: "Ask Me Later",
//             buttonNegative: "Cancel",
//             buttonPositive: "OK",
//           }
//         );
//         return granted === PermissionsAndroid.RESULTS.GRANTED;
//       } else {
//         const { status } = await Audio.requestPermissionsAsync();
//         return status === "granted";
//       }
//     } catch (err) {
//       console.warn("Permission error:", err);
//       return false;
//     }
//   };

  // Start recording
//   const startRecording = async (): Promise<void> => {
//   const hasPermission = await getPermission(); // Assume getPermission typed elsewhere
//   if (!hasPermission) {
//     Alert.alert(
//       "Permission Required",
//       "Permission to record audio is required!"
//     );
//     return;
//   }

//   try {
//     await Audio.setAudioModeAsync({
//       allowsRecordingIOS: true,
//       playsInSilentModeIOS: true,
//     });

//     // ✅ Typed options with HIGH_QUALITY preset (avoids constant errors)
//     const recordingOptions: AudioRecordingOptions = {
//       android: {
//         extension: ".m4a",
//         sampleRate: 44100,
//         numberOfChannels: 1,
//         bitRate: 128000,
//       },
//       ios: {
//         extension: ".m4a",
//         sampleRate: 44100,
//         numberOfChannels: 1,
//         bitRate: 128000,
//         audioQuality: Audio.IOS_AUDIO_QUALITY_HIGH, // ✅ Constant (update expo-av if missing)
//         meters: false,
//       },
//     };

//     // Fallback if constants missing (string values—use after update)
//     // recordingOptions.ios.audioQuality = 'high' as any; // Type assertion if needed

//     const { recording: newRecording } = await Audio.Recording.createAsync(
//       Audio.RECORDING_OPTIONS_PRESETS.HIGH_QUALITY // ✅ Preset (AAC, 44100Hz, 1 channel—matches your specs)
//     );

//     recordingRef.current = newRecording;
//     setIsRecording(true); // Assume setIsRecording typed in component
//     Alert.alert("Recording", "Voice recording started...");
//   } catch (err) {
//     console.error("Failed to start recording", err);
//     Alert.alert("Recording Error", "Could not start recording.");
//   }
// };

  // Stop recording and upload for transcription
//   const stopRecording = async (): Promise<void> => {
//     const recording = recordingRef.current;
//     if (!recording) return;

//     try {
//       setIsRecording(false);
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       recordingRef.current = null;

//       if (!uri) {
//         Alert.alert("Error", "No audio recorded.");
//         return;
//       }

//       Alert.alert("Processing", "Transcribing your voice...");

//       // Upload audio to backend for transcription
//       const transcript = await transcribeAudio(uri);
//       if (transcript) {
//         setInputText((prev) => prev + " " + transcript.trim());
//       }
//     } catch (err) {
//       console.error("Failed to stop recording", err);
//       Alert.alert("Error", "Failed to process audio.");
//     }
//   };

  // Upload audio file and get transcript from backend
  const transcribeAudio = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const fileName = "voice_note_" + Date.now() + ".m4a";
    const type = "audio/m4a";

    formData.append("file", {
      uri,
      name: fileName,
      type,
    } as any);

    try {
      const response = await axios.post(
        "https://your-api.com/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );
      return response.data.text || "";
    } catch (error: any) {
      console.error(
        "Transcription error:",
        error.response?.data || error.message
      );
      Alert.alert("Transcription Failed", "Could not convert voice to text.");
      return "";
    }
  };

  // File Upload Handler
  const handleFileUpload = async (): Promise<void> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const { name, size, uri } = asset;

      let fileType = name.split(".").pop();
      const fileToUpload = {
        name,
        size,
        uri:
          Platform.OS === "android" && uri[0] === "/" ? `file://${uri}` : uri,
        type: `application/${fileType}`,
      };

      setFileData(fileToUpload);
      setFileName(name);
      setFiles((prev) => [
        ...prev,
        { id: Date.now().toString(), name, uri: fileToUpload.uri },
      ]);
    }
  };

  const handleRemoveFile = (id: string): void => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (files.length === 1) {
      setFileData(null);
      setFileName("");
    }
  };

  const handleSend = (): void => {
    console.log("Handle Send Triggered");
    if (onSendMessage) {
      onSendMessage(inputText.trim(), fileData);
    }
    
    const finalQuery = inputText.trim();
    if (!finalQuery && !fileData) return;

    // if (navigation) {
    //   navigation.navigate("GenOxyChatScreen", {
    //     query: finalQuery,
    //     category: "General",
    //     assistantId: "64564t6464",
    //     categoryType: "ChatInput",
    //     fd: fileData, // pass file data
    //   });
    // } else {
    //   Alert.alert("Navigation Error", "Navigation prop is missing");
    // }

    setInputText("");
    // Optionally clear files after send
    // setFiles([]); setFileData(null);
  };

//   const handleVoiceRecord = (): void => {
//     if (isRecording) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

  return (
    <View
      style={[
        styles.container,
        // { backgroundColor: currentTheme.container },
        // containerStyle,
      ]}
    >
      {/* File Preview */}
      {files.length > 0 && (
        <FlatList
          horizontal
          data={files}
          keyExtractor={(item: FileItem) => item.id}
          renderItem={({ item }: { item: FileItem }) => (
            <View style={styles.filePreview}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveFile(item.id)}>
                <Ionicons name="close-circle" size={18} color="red" />
              </TouchableOpacity>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        />
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: currentTheme.input,
            borderColor: currentTheme.border,
          },
        ]}
      >
        {/* Attachment Button */}
        {showAttachment && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFileUpload}
          >
            <Ionicons
              name="attach"
              size={20}
              color={currentTheme.buttonInactive}
            />
          </TouchableOpacity>
        )}

        {/* Custom Left Buttons */}
        {customButtons
          .filter((btn: CustomButton) => btn.position === "left")
          .map((button: CustomButton, index: number) => (
            <TouchableOpacity
              key={`left-${index}`}
              style={styles.actionButton}
              onPress={button.onPress}
            >
              <Ionicons
                name={button.icon as any}
                size={button.size || 20}
                color={currentTheme.buttonInactive}
              />
            </TouchableOpacity>
          ))}

        {/* Text Input */}
        <TextInput
          style={[styles.textInput, { color: currentTheme.text }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={currentTheme.placeholder}
          value={inputText}
          onChangeText={setInputText}
          multiline={multiline}
          maxLength={maxLength}
          textAlignVertical={multiline ? "top" : "center"}
        />

        {/* Mic Button */}
        {/* {showMic && enableVoice && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleVoiceRecord}
          >
            <Ionicons
              name={isRecording ? "stop-circle" : "mic-outline"}
              size={24}
              color={isRecording ? "#e53e3e" : currentTheme.buttonInactive}
            />
          </TouchableOpacity>
        )} */}

        {/* Send Button */}
        {showSend && (
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() || fileData
                    ? currentTheme.sendActive
                    : currentTheme.sendInactive,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() && !fileData}
          >
            <Ionicons name="send" size={18} color="#ffffff" style={{left:3,top:2}}/>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    // paddingTop: 10,
    paddingBottom: 55,
    // borderTopWidth: 1,
    // borderTopColor: "#4a5568",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    minHeight: 50,
    maxHeight: 120,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    marginHorizontal: 4,
    padding: 6,
    borderRadius: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 20,
    lineHeight: 22,
  },
  sendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    marginRight: 8,
  },
  fileName: {
    fontSize: 13,
    marginRight: 6,
    maxWidth: screenWidth * 0.6,
  },
});

export default ChatInput;