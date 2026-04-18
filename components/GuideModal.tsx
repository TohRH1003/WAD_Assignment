import React from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import {appStyles as styles} from '../styles/AppStyles';

type GuideInfo = {
  title: string;
  steps: string[];
};

type GuideModalProps = {
  guideInfo: GuideInfo | null;
  visible: boolean;
  onClose: () => void;
};

const GuideModal = ({guideInfo, visible, onClose}: GuideModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {guideInfo?.title || 'App Guide'}
          </Text>
          {guideInfo?.steps.map((step, index) => (
            <Text key={step} style={styles.modalStep}>
              {index + 1}. {step}
            </Text>
          ))}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onClose}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GuideModal;
