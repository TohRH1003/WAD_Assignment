import React from 'react';
import {Modal, Text, View} from 'react-native';
import {MyButton} from './MyCustomComponent';
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
    <Modal // modal component to show app guide, it flows from the bottom of the screen and covers part of the content, allowing users to still see the context of where they are in the app while viewing the guide.
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
          <MyButton title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default GuideModal;
