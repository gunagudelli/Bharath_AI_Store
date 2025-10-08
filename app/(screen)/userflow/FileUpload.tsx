import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
// import type { DocumentPickerResponse } from 'expo-document-picker';
import axios, { AxiosResponse } from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import BASE_URL from '../../../config';
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/types";

const { width, height } = Dimensions.get('window');

interface UserState {
  accessToken: string;
}

interface FileUploadProps {
  assistantId: string;
}

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'uploaded';

interface UploadedFile {
  name: string;
  size: number;
  uri: string;
  mimeType?: string;
  uploadResponse?: any;
}
  
const FileUpload: React.FC<FileUploadProps> = ({ assistantId }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const token = useSelector((state: RootState) => state.userData?.accessToken);
 const userId = useSelector((state: RootState) => state.userData?.userId);

  const pickDocument = async (): Promise<void> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
        'text/csv',
        'text/plain',
      ],
      copyToCacheDirectory: true,
    });

    console.log('Document Picker Result:', result);

    if (result.canceled) {
      console.log('Document selection was canceled.');
      return;
    }

    const file: UploadedFile = {
      name: result.assets?.[0]?.name ?? 'unnamed-file',
      size: result.assets?.[0]?.size ?? 0,
      uri: result.assets?.[0]?.uri ?? '',
      mimeType: result.assets?.[0]?.mimeType,
    };

    setSelectedFile(file);
    setUploadStatus('selected');
    console.log('Selected File:', file.name, file.size, file.uri);
  };

  const uploadFile = async (): Promise<void> => {
    console.log('Starting file upload...');

    if (!selectedFile) {
      Alert.alert('No file selected', 'Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: selectedFile.uri,
      name: selectedFile.name ?? 'unnamed-file',
      type: selectedFile.mimeType ?? 'application/octet-stream',
    } as any); 

    console.log('Form Data Prepared for file:', selectedFile.name);
    setUploading(true);
    setUploadStatus('uploading');

    try {
      const response: AxiosResponse<any> = await axios.post(
        `${BASE_URL}ai-service/agent/${encodeURIComponent(assistantId)}/addfiles`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Upload Response:', response);
      setUploadedFile({
        ...selectedFile,
        uploadResponse: response.data,
      });
      setUploadStatus('uploaded');
      Alert.alert('Success', 'File uploaded successfully!');
    } catch (error: any) {
      console.log('Upload Error:', error.response);
      setUploadStatus('selected');
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (): void => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedFile(null);
            setUploadedFile(null);
            setUploadStatus('idle');
            console.log('File removed');
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileInfo = (): React.ReactNode => {
    const file: UploadedFile | null = uploadedFile || selectedFile;
    if (!file) return null;

    return (
      <View
        style={[
          styles.fileInfo,
          uploadStatus === 'uploaded' && styles.uploadedFileInfo,
        ]}>
        <View style={styles.fileInfoHeader}>
          <MaterialIcons
            name={uploadStatus === 'uploaded' ? 'check-circle' : 'description'}
            size={20}
            color={uploadStatus === 'uploaded' ? '#28a745' : '#007bff'}
          />
          <Text
            style={[
              styles.fileName,
              uploadStatus === 'uploaded' && styles.uploadedFileName,
            ]}>
            {file.name}
          </Text>
        </View>

        <Text style={styles.fileInfoText}>Size: {formatFileSize(file.size)}</Text>

        {uploadStatus === 'uploaded' && (
          <View style={styles.uploadSuccessIndicator}>
            <MaterialIcons name="cloud-done" size={16} color="#28a745" />
            <Text style={styles.uploadSuccessText}>Uploaded successfully</Text>
          </View>
        )}
      </View>
    );
  };

  const renderActionButton = (): React.ReactNode => {
    switch (uploadStatus) {
      case 'idle':
        return (
          <TouchableOpacity style={styles.button} onPress={pickDocument}>
            <MaterialIcons name="attach-file" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Choose File</Text>
          </TouchableOpacity>
        );

      case 'selected':
        return (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={uploadFile}>
              <MaterialIcons name="cloud-upload" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Upload File</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickDocument}>
              <MaterialIcons name="swap-horiz" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Change File</Text>
            </TouchableOpacity>
          </View>
        );

      case 'uploading':
        return (
          <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled>
            <ActivityIndicator color="#fff" size="small" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Uploading...</Text>
          </TouchableOpacity>
        );

      case 'uploaded':
        return (
          <View style={styles.actionButtonsContainers}>
            <TouchableOpacity style={[styles.buttons, styles.successButton]} disabled>
              <MaterialIcons name="check-circle" size={20} color="#fff" style={styles.buttonIcons} />
              <Text style={styles.buttonTexts}>Upload Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttons, styles.secondaryButton]}
              onPress={() => {
                setSelectedFile(null);
                setUploadedFile(null);
                setUploadStatus('idle');
                console.log('File removed');
                pickDocument();
              }}>
              <MaterialIcons name="file-upload" size={20} color="#fff" style={styles.buttonIcons} />
              <Text style={styles.buttonTexts}>Add another File</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderFileInfo()}
      {renderActionButton()}

      {uploading && (
        <View style={styles.uploadProgress}>
          <Text style={styles.statusText}>Uploading file... Please wait</Text>
          <Text style={styles.statusSubText}>This may take a moment for large files</Text>
        </View>
      )}
    </View>
  );
};

export default FileUpload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#28a745',
  },
  secondaryButton: {
    // backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  successButton: {
    backgroundColor: '#28a745',
    opacity: 0.8,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#007bff',
  },
  actionButtonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  fileInfo: {
    backgroundColor: '#e9ecef',
    padding: 20,
    borderRadius: 12,
    marginVertical: 15,
    width: '100%',
    maxWidth: 320,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  uploadedFileInfo: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745',
  },
  fileInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  uploadedFileName: {
    color: '#155724',
  },
  fileInfoText: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 2,
  },
  uploadSuccessIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#c3e6cb',
  },
  uploadSuccessText: {
    fontSize: 12,
    color: '#155724',
    marginLeft: 4,
    fontWeight: '500',
  },
  uploadProgress: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusSubText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButtonsContainers: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  buttons: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.25,
    marginRight: 10,
  },
  buttonIcons: {
    marginLeft: 3,
    marginRight: 3,
  },
  buttonTexts: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    // marginLeft: -3,
    width: width * 0.15,
    // marginRight: 3
  },
});