import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Props interface
interface BmvCoinsFaqProps {
  visible: boolean;
  onClose: () => void;
}

// Type for FAQ question
interface FAQQuestion {
  question: string;
  answer: string;
}

// Type for FAQ group
interface FAQGroup {
  title: string;
  questions: FAQQuestion[];
}

const BmvCoinsFaq: React.FC<BmvCoinsFaqProps> = ({ visible, onClose }) => {
  const [openIndex, setOpenIndex] = useState<{ group: number | null; question: number | null }>({ group: null, question: null });

  const groupedFaqs: FAQGroup[] = [
    {
      title: 'Crypto vs No GST Goods',
      questions: [
        {
          question: 'Can I use crypto for GST-free goods?',
          answer: 'Yes, only for non-GST items like unbranded grains.',
        },
        {
          question: 'Is crypto allowed for regular shopping?',
          answer: 'Only if both buyer and seller agree.',
        },
        {
          question: 'Are crypto rewards taxable?',
          answer: 'Yes, they may be under capital gains rules.',
        },
      ],
    },
    {
      title: 'GST vs 1–25kg & 26kg+',
      questions: [
        {
          question: 'Why buy 26kg rice bags?',
          answer: 'To avoid 5% GST on smaller packs.',
        },
        {
          question: "What's GST on 1–25kg bags?",
          answer: '5% on the bag\'s total value.',
        },
        {
          question: 'Is GST added to unpackaged rice?',
          answer: 'No, only packed goods under 25kg.',
        },
        {
          question: 'Can coins be used to avoid GST?',
          answer:
            'The government may ask why using coins avoids GST. Hence, coins can be exchanged with goods for non-GST goods only.',
        },
      ],
    },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#4776E6', '#8E54E9']} style={styles.gradient}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Frequently Asked Questions</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              {groupedFaqs.map((group, groupIndex) => (
                <View key={groupIndex}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.questions.map((faq, qIndex) => {
                    const isOpen: boolean = openIndex.group === groupIndex && openIndex.question === qIndex;
                    return (
                      <View key={qIndex} style={styles.faqContainer}>
                        <TouchableOpacity
                          onPress={() =>
                            setOpenIndex(
                              isOpen ? { group: null, question: null } : { group: groupIndex, question: qIndex }
                            )
                          }
                        >
                          <View style={styles.questionContainer}>
                            <Text style={styles.question}>{faq.question}</Text>
                            <Text style={styles.icon}>{isOpen ? '▲' : '▼'}</Text>
                          </View>
                        </TouchableOpacity>
                        {isOpen && <Text style={styles.answer}>{faq.answer}</Text>}
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  faqContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginLeft: 8,
  },
  answer: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default BmvCoinsFaq;