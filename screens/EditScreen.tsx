import React, {useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {getUserByUsername} from '../DatabaseOperation/Authentication';
import {UpdateUserInfo} from '../DatabaseOperation/UpdateUser';
import {RootStackParamList} from '../AppStackTypes';
import {appStyles as styles} from '../styles/AppStyles';

type EditFormState = {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
};

const emptyForm: EditFormState = {
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
};

const EditScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Edit'>>();
  const {username} = route.params;
  const [form, setForm] = useState<EditFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUserByUsername(username);

        if (!user) {
          Alert.alert('User not found', 'Unable to load profile information.');
          navigation.navigate('Profile', {username});
          return;
        }

        setForm({
          username: user.username,
          password: '',
          confirmPassword: '',
          name: user.name,
          email: user.email,
        });
      } catch (error: any) {
        Alert.alert('Load failed', error.message || 'Unable to load user.');
      }
    };

    loadUser();
  }, [navigation, username]);

  const updateForm = (field: keyof EditFormState, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const renderInput = (
    label: string,
    field: keyof EditFormState,
    options?: {secureTextEntry?: boolean; editable?: boolean},
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={form[field]}
        onChangeText={value => updateForm(field, value)}
        secureTextEntry={options?.secureTextEntry}
        editable={options?.editable ?? true}
        style={[
          styles.input,
          options?.editable === false ? styles.inputDisabled : null,
        ]}
        autoCapitalize="none"
      />
    </View>
  );

  const handleSave = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Password and confirm password must match.',
      );
      return;
    }

    try {
      setIsSaving(true);
      await UpdateUserInfo(form.username, form.password, form.name, form.email);
      Alert.alert('Profile updated', 'Your account details have been saved.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('Profile', {username: form.username}),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Update failed', error.message || 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.subtitle}>Update your account information here</Text>

      <View style={styles.card}>
        {renderInput('Username', 'username', {editable: false})}
        {renderInput('Password', 'password', {secureTextEntry: true})}
        {renderInput('Confirm Password', 'confirmPassword', {
          secureTextEntry: true,
        })}
        {renderInput('Full Name', 'name')}
        {renderInput('Email', 'email')}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Profile', {username})}
          activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditScreen;
