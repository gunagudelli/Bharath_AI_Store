// utils/apk-download-handler.js - Handle APK Download Completion
import { Alert, Linking } from 'react-native';

export const handleAPKDownload = async (downloadUrl, fileName) => {
  try {
    console.log('📥 Starting APK download:', downloadUrl);
    
    // Test if download URL is accessible
    const testResponse = await fetch(downloadUrl, { method: 'HEAD' });
    
    if (!testResponse.ok) {
      throw new Error(`Server returned ${testResponse.status}: ${testResponse.statusText}`);
    }
    
    // Check if we can open URLs
    const canOpen = await Linking.canOpenURL(downloadUrl);
    if (!canOpen) {
      throw new Error('Cannot open download URLs on this device');
    }
    
    // Open the download URL
    await Linking.openURL(downloadUrl);
    
    Alert.alert(
      '✅ Download Started!',
      `${fileName} is downloading...\\n\\n📱 Check your Downloads folder\\n🔒 Enable \"Install from Unknown Sources\"\\n🚀 Install and enjoy your AI app!`,
      [
        { text: 'Got it!', style: 'default' },
        { 
          text: 'Open Downloads', 
          onPress: () => {
            Linking.openURL('content://downloads/my_downloads').catch(() => {
              console.log('Could not open downloads folder');
            });
          }
        }
      ]
    );
    
  } catch (error) {
    console.error('❌ Download Error:', error);
    
    Alert.alert(
      '❌ Download Failed',
      `${error.message}\\n\\nTry again or contact support.\\n\\nDirect link:\\n${downloadUrl}`,
      [
        { text: 'Retry', onPress: () => handleAPKDownload(downloadUrl, fileName) },
        { text: 'Copy Link', onPress: () => {
          console.log('Copy link:', downloadUrl);
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }
};