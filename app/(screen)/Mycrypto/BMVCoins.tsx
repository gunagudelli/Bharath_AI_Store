import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import React from 'react';
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Props interface
interface BVMCoinsProps {
  modalVisible: boolean;
  onCloseModal: () => void;
  content?: string;
}

// Type for parsed section
interface ParsedSection {
  id: number;
  lines: string[];
}

// Type for exchange rate
interface ExchangeRate {
  coins: string;
  rupees: string;
}

const BVMCoins: React.FC<BVMCoinsProps> = ({ modalVisible, onCloseModal, content }) => {
  // Function to parse dynamic content
  const parseContent = (text: string | undefined): ParsedSection[] | null => {
    if (!text) return null;

    const sections = text.split('---').filter((section) => section.trim());
    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter((line) => line.trim());
      return {
        id: index,
        lines,
      };
    });
  };

  // Function to render text with formatting
  const renderFormattedText = (text: string): React.ReactNode[] => {
    // Handle bold text wrapped in *text* and replace BMVCoins with BMVCOINS
    const parts = text.replace(/BMVCoins/g, 'BMVCOINS').split(/(\*[^*]+\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const boldText = part.slice(1, -1);
        return (
          <Text key={index} style={styles.boldText}>
            {boldText}
          </Text>
        );
      }
      return part;
    });
  };

  // Function to get icon based on line content
  const getIconForLine = (text: string): React.ReactNode | null => {
    if (text.includes('💡') || text.includes('What are')) {
      return <MaterialIcons name="lightbulb-outline" size={18} color="#FFC107" />;
    }
    if (text.includes('💸') || text.includes('How to Use')) {
      return <MaterialIcons name="account-balance-wallet" size={18} color="#4CAF50" />;
    }
    if (text.includes('🚀') || text.includes("🚀 What's Next")) {
      return <MaterialCommunityIcons name="rocket-launch" size={18} color="#FF6B35" />;
    }
    if (text.includes('🛍') || text.includes('Keep Shopping')) {
      return <MaterialIcons name="shopping-bag" size={18} color="#9C27B0" />;
    }
    if (text.includes('❓') || text.includes('Why are')) {
      return <MaterialIcons name="help-outline" size={18} color="#2196F3" />;
    }
    if (text.includes('✅') || text.includes('🔁') || text.includes('📊')) {
      return <MaterialIcons name="check-circle" size={16} color="#4CAF50" />;
    }
    if (text.includes('🎯')) {
      return <MaterialIcons name="gps-fixed" size={16} color="#FF9800" />;
    }
    if (text.includes('📜')) {
      return <MaterialIcons name="description" size={16} color="#795548" />;
    }
    return null;
  };

  // Function to determine if line is a title
  const isTitle = (text: string): boolean => {
    return (
      text.includes('####') ||
      text.includes('###') ||
      text.includes('💡') ||
      text.includes('💸') ||
      text.includes('🚀') ||
      text.includes('🛍') ||
      text.includes('❓') ||
      text.includes('Welcome to the World of BMVCOINS')
    );
  };

  // Function to determine if line is a subtitle
  const isSubtitle = (text: string): boolean => {
    return text.startsWith('We allow BMVCOINS') || text.startsWith("Here's why:");
  };

  // Function to determine if line is a bullet point
  const isBulletPoint = (text: string): boolean => {
    return (
      text.trim().startsWith('*') ||
      text.trim().startsWith('-') ||
      text.includes('✅') ||
      text.includes('🔁') ||
      text.includes('📊') ||
      text.includes('🎯') ||
      text.includes('📜')
    );
  };

  // Function to determine if line is a note or special text
  const isNote = (text: string): boolean => {
    return text.includes('Note:') || text.includes('Projected value') || text.startsWith('✅ Simple rule:') || text.startsWith('>');
  };

  // Function to determine if line is a highlight box
  const isHighlightBox = (text: string): boolean => {
    return (
      text.includes('1000 BMVCOINS = ₹20') ||
      text.includes('Use on *non-GST items*') ||
      text.includes('Track your coin balance')
    );
  };

  // Function to extract exchange rate info
  const getExchangeRate = (content: string | undefined): ExchangeRate => {
    const match = content?.match(/(\d+)\s*BMVCOINS\s*=\s*₹(\d+)/);
    if (match) {
      return { coins: match[1], rupees: match[2] };
    }
    return { coins: '1000', rupees: '20' };
  };

  const parsedSections = parseContent(content);
  const exchangeRate = getExchangeRate(content);

  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => onCloseModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.coinIconContainer}>
                  <FontAwesome5 name="coins" size={22} color="#F1C40F" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>BMVCOINS</Text>
                  <Text style={styles.modalSubtitle}>Powered by OXYCHAIN</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => onCloseModal()}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
              {/* Exchange Rate Box - Always shown */}
              <View style={styles.exchangeRateBox}>
                <View style={styles.exchangeHeader}>
                  <MaterialCommunityIcons name="currency-inr" size={20} color="#4A148C" />
                  <Text style={styles.exchangeTitle}>Current Exchange Rate</Text>
                </View>
                <View style={styles.rateContainer}>
                  <FontAwesome5 name="coins" size={20} color="#F1C40F" />
                  <Text style={styles.rateText}>
                    {exchangeRate.coins} BMVCOINS = ₹{exchangeRate.rupees}
                  </Text>
                </View>
                <Text style={styles.rateSubtext}>
                  ₹{(parseFloat(exchangeRate.rupees) / parseFloat(exchangeRate.coins)).toFixed(3)} per coin
                </Text>
              </View>

              {/* Dynamic Content Sections */}
              {parsedSections?.map((section) => (
                <View key={section.id} style={styles.dynamicSection}>
                  {section.lines.map((line, lineIndex) => {
                    const cleanLine = line.replace(/^[#\s]+/, '').replace(/^>\s*/, '').trim();

                    if (isTitle(cleanLine)) {
                      return (
                        <View key={lineIndex} style={styles.titleContainer}>
                          {getIconForLine(cleanLine)}
                          <Text style={styles.sectionTitle}>
                            {renderFormattedText(cleanLine)}
                          </Text>
                        </View>
                      );
                    }

                    if (isSubtitle(cleanLine)) {
                      return (
                        <View key={lineIndex} style={styles.subtitleContainer}>
                          <Text style={styles.subtitleText}>
                            {renderFormattedText(cleanLine)}
                          </Text>
                        </View>
                      );
                    }

                    if (isHighlightBox(cleanLine)) {
                      return (
                        <View key={lineIndex} style={styles.highlightBox}>
                          <Text style={styles.highlightText}>
                            {renderFormattedText(cleanLine)}
                          </Text>
                        </View>
                      );
                    }

                    if (isBulletPoint(cleanLine)) {
                      const bulletText = cleanLine
                        .replace(/^\*\s*/, '')
                        .replace(/^-\s*/, '')
                        .replace(/^[✅🔁📊🎯📜]\s*/, '');
                      return (
                        <View key={lineIndex} style={styles.bulletContainer}>
                          <View style={styles.bulletPoint}>
                            {getIconForLine(cleanLine) || <MaterialIcons name="check-circle" size={16} color="#4CAF50" />}
                            <Text style={styles.bulletText}>
                              {renderFormattedText(bulletText)}
                            </Text>
                          </View>
                        </View>
                      );
                    }

                    if (isNote(cleanLine)) {
                      return (
                        <View key={lineIndex} style={styles.noteContainer}>
                          <Ionicons name="information-circle" size={16} color="#2196F3" />
                          <Text style={styles.noteText}>
                            {renderFormattedText(cleanLine)}
                          </Text>
                        </View>
                      );
                    }

                    if (cleanLine.length > 0) {
                      return (
                        <Text key={lineIndex} style={styles.regularText}>
                          {renderFormattedText(cleanLine)}
                        </Text>
                      );
                    }

                    return null;
                  })}
                </View>
              ))}

              {/* Default content if no dynamic content provided */}
              {!content && (
                <View style={styles.defaultContent}>
                  <Text style={styles.regularText}>
                    Collect BMVCOINS and redeem them for discounts on rice bags and other products across our platform.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Action Button */}
            <TouchableOpacity style={styles.gotItButton} onPress={() => onCloseModal()}>
              <Text style={styles.gotItText}>Got it</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BVMCoins;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '92%',
    maxWidth: 420,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coinIconContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#7B68EE',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  exchangeRateBox: {
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  exchangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exchangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A148C',
    marginLeft: 8,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A148C',
    marginLeft: 12,
  },
  rateSubtext: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  dynamicSection: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
    flex: 1,
  },
  subtitleContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  subtitleText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    fontWeight: '500',
  },
  highlightBox: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  highlightText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    lineHeight: 20,
  },
  bulletContainer: {
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    flex: 1,
    marginLeft: 10,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  noteText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
  },
  regularText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 22,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  defaultContent: {
    padding: 20,
  },
  gotItButton: {
    backgroundColor: '#4A148C',
    borderRadius: 16,
    paddingVertical: 16,
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#4A148C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gotItText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});