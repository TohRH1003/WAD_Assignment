import React from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import {appStyles as styles} from '../styles/AppStyles';

const getButtonStyle = (variant: any) => {
  switch (variant) {
    case 'secondary':
      return styles.secondaryButton;
    case 'link':
      return styles.linkButton;
    case 'header':
      return styles.headerGuideButton;
    case 'primary':
    default:
      return styles.primaryButton;
  }
};

const getButtonTextStyle = (variant: any) => {
  switch (variant) {
    case 'secondary':
      return styles.secondaryButtonText;
    case 'link':
      return styles.linkButtonText;
    case 'header':
      return styles.headerGuideButtonText;
    case 'primary':
    default:
      return styles.primaryButtonText;
  }
};

export const MyTextInput = ({
  label,
  editable = true,
  ...props
}: any) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput {...props} editable={editable} style={editable ? styles.input : styles.inputDisabled} />
    </View>
  );
};

export const MyButton = ({
  title,
  variant = 'primary',
  activeOpacity = 0.8,
  ...props
}: any) => {
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={activeOpacity}
      style={getButtonStyle(variant)}>
      <Text style={getButtonTextStyle(variant)}>{title}</Text>
    </TouchableOpacity>
  );
};
