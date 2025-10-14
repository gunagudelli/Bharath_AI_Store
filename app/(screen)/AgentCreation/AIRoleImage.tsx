// AIRoleImage.tsx - AI Role Image Component with Shadow Card
// Typed props for style/containerStyle (StyleProp<ViewStyle>); navigation typed but unused.
// Consistent with project theme (COLORS.primary); production-ready, reusable.

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
// import { RootStackParamList } from '../../../../types/TS navigation'; // Adjust path to your types
// import { COLORS } from '../../../../Redux/constants/theme'; // Assume typed as { primary: string }

const { width, height } = Dimensions.get('window');

interface AIRoleImageProps {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const AIRoleImage: React.FC<AIRoleImageProps> = ({ style, containerStyle }) => {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>(); // Typed navigation (unused here)

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Image
        source={{ uri: 'https://www.askoxy.ai/static/media/ca3.4e7e85ad9253663f7680.png' }} 
        style={styles.image} 
      />
    </View>
  );
};

export default AIRoleImage;

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    minHeight: height / 10,
    backgroundColor: '#9333ea',
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2.84,
    elevation: 8,
  },
  image: {
    width: width * 0.8,
    height: 80,
    borderRadius: 50,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
    textAlign: 'center',
  },
});