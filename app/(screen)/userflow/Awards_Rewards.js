import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Linking,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { WebView } from 'react-native-webview';

// ✅ Import images
const awardImages = {
  A1: require('../../../assets/img/award1.jpg'),
  A2: require('../../../assets/img/award2.jpg'),
  A3: require('../../../assets/img/award3.jpg'),
  A4: require('../../../assets/img/award4.jpg'),
  A5: require('../../../assets/img/award5.jpg'),
  A6: require('../../../assets/img/award6.jpg'),
  A7: require('../../../assets/img/award7.jpg'),
  A8: require('../../../assets/img/award8.jpg'),
  A9: require('../../../assets/img/award9.jpg'),
  A10: require('../../../assets/img/award10.jpg'),
  A11: require('../../../assets/img/award11.jpg'),
  A12: require('../../../assets/img/award12.jpg'),
  A14: require('../../../assets/img/award14.jpg'),
  A15: require('../../../assets/img/award16.jpg'),
  A16: require('../../../assets/img/award17.jpg'),
};

const SafeImage = ({ source, alt, style = {}, onPress }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <TouchableOpacity 
      style={[styles.safeImageContainer, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {!loaded && !errored && (
        <View style={styles.imagePlaceholder} />
      )}
      {!errored ? (
        <Image
          source={source}
          accessibilityLabel={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={[
            styles.image,
            { opacity: loaded ? 1 : 0 }
          ]}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imageErrorContainer}>
          <Text style={styles.imageErrorText}>Image not available</Text>
          <Text style={styles.imageErrorSubText}>{alt}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Image Modal Component with Zoom and Pan
const ImageModal = ({ visible, imageSource, onClose }) => {
  const [scale] = useState(new Animated.Value(1));
  const [translateX] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(0));
  const [lastScale, setLastScale] = useState(1);
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    const newScale = lastScale * 1.5;
    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
    setLastScale(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(1, lastScale / 1.5);
    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
    setLastScale(newScale);
  };

  const handleReset = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
    setLastScale(1);
    setLastTranslate({ x: 0, y: 0 });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (lastScale > 1) {
        translateX.setValue(lastTranslate.x + gestureState.dx);
        translateY.setValue(lastTranslate.y + gestureState.dy);
      }
    },
    onPanResponderRelease: () => {
      setLastTranslate({
        x: translateX._value,
        y: translateY._value,
      });
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleReset}>
            <Text style={styles.zoomButtonText}>⟲</Text>
          </TouchableOpacity>
        </View>

        {/* Image with Zoom and Pan */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalContent}>
            <Animated.Image
              source={imageSource}
              style={[
                styles.zoomedImage,
                {
                  transform: [
                    { scale },
                    { translateX },
                    { translateY },
                  ],
                },
              ]}
              resizeMode="contain"
              {...panResponder.panHandlers}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const Awards_Rewards = () => {
  const { width: screenWidth } = Dimensions.get('window');
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Calculate responsive dimensions
  const isSmallScreen = screenWidth < 640;
  const isMediumScreen = screenWidth >= 640 && screenWidth < 1024;
  
  const videoWidth = isSmallScreen ? screenWidth - 48 : 
                    isMediumScreen ? (screenWidth - 64) / 2 : 
                    (screenWidth - 96) / 3;
  
  const awardItemWidth = isSmallScreen ? screenWidth - 48 :
                        isMediumScreen ? (screenWidth - 64) / 2 :
                        (screenWidth - 96) / 3;

  const videos = [
    { 
      src: "https://www.youtube.com/embed/zyMV0Qj0lPU",
      youtubeId: "zyMV0Qj0lPU"
    },
    { 
      src: "https://drive.google.com/file/d/1vFxflNUzjZpuQjBnG3wX1tS_dhwTkTcL/preview",
      youtubeId: null 
    },
    { 
      src: "https://www.youtube.com/embed/gp4F5Z1ZdUg",
      youtubeId: "gp4F5Z1ZdUg"
    },
  ];

  const awards = [
    { image: awardImages.A1 },
    { image: awardImages.A2 },
    { image: awardImages.A3 },
    { image: awardImages.A4 },
    { image: awardImages.A5 },
    { image: awardImages.A11 },
    { image: awardImages.A12 },
    { image: awardImages.A6 },
    { image: awardImages.A7 },
    { image: awardImages.A8 },
    { image: awardImages.A9 },
    { image: awardImages.A10 },
    { image: awardImages.A16 },
    { image: awardImages.A14 },
    { image: awardImages.A15 },
  ];

  const openYouTube = (youtubeId) => {
    if (!youtubeId) {
      Alert.alert('Info', 'This video cannot be opened in YouTube.');
      return;
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    const youtubeAppUrl = `vnd.youtube://watch?v=${youtubeId}`;

    // Try to open YouTube app first, then fallback to browser
    Linking.canOpenURL(youtubeAppUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(youtubeAppUrl);
        } else {
          return Linking.openURL(youtubeUrl);
        }
      })
      .catch(() => {
        Linking.openURL(youtubeUrl);
      });
  };

  const handleVideoPress = (youtubeId) => {
    openYouTube(youtubeId);
  };

  const handleImagePress = (imageSource) => {
    setSelectedImage(imageSource);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Awards & Rewards</Text>
        <Text style={styles.subtitle}>
          Celebrating our milestones, teamwork, and the incredible community
          behind our success.
        </Text>
      </View>

      {/* 🎥 Videos Section */}
      <View style={styles.section}>
        <View style={[
          styles.videosGrid,
          {
            flexDirection: isSmallScreen ? 'column' : 'row',
            flexWrap: isSmallScreen ? 'nowrap' : 'wrap',
          }
        ]}>
          {videos.map((video, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.videoCard,
                {
                  width: videoWidth,
                  marginBottom: 24,
                  marginHorizontal: isSmallScreen ? 0 : 8,
                }
              ]}
              activeOpacity={0.7}
              onPress={() => handleVideoPress(video.youtubeId)}
            >
              <View style={styles.videoContainer}>
                <WebView
                  source={{ uri: `${video.src}?rel=0&modestbranding=1` }}
                  style={styles.video}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsFullscreenVideo={true}
                />
                <View style={styles.videoOverlay}>
                  <Text style={styles.playButton}>▶</Text>
                  <Text style={styles.watchOnYouTube}>Watch on YouTube</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 🏅 Awards Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Achievements</Text>
        
        {/* 🖼️ Grid for awards */}
        <View style={[
          styles.awardsGrid,
          {
            flexDirection: isSmallScreen ? 'column' : 'row',
            flexWrap: isSmallScreen ? 'nowrap' : 'wrap',
          }
        ]}>
          {awards.map((award, idx) => (
            <View
              key={idx}
              style={[
                styles.awardCard,
                {
                  width: awardItemWidth,
                  marginBottom: 24,
                  marginHorizontal: isSmallScreen ? 0 : 8,
                }
              ]}
            >
              <SafeImage
                source={award.image}
                alt={`Award ${idx + 1}`}
                style={styles.awardImage}
                onPress={() => handleImagePress(award.image)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Image Modal */}
      <ImageModal
        visible={modalVisible}
        imageSource={selectedImage}
        onClose={closeModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 500,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 24,
  },
  videosGrid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    position: 'relative',
  },
  video: {
    flex: 1,
    borderRadius: 16,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  playButton: {
    fontSize: 48,
    color: 'white',
    marginBottom: 8,
  },
  watchOnYouTube: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  awardsGrid: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  awardCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  awardImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  awardImage: {
    borderRadius: 16,
  },
  safeImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  imageErrorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  imageErrorSubText: {
    fontSize: 12,
    color: '#64748b',
    opacity: 0.8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  zoomControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    flexDirection: 'row',
  },
  zoomButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoomedImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default Awards_Rewards;