import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {getUserByUsername} from '../DatabaseOperation/Authentication';
import {UpdateUserInfo} from '../DatabaseOperation/UpdateUser';
import {MyButton, MyTextInput} from '../components/MyCustomComponent';
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

const EditScreen = ({navigation, route}: any) => {
  const {username} = route.params;
  const [form, setForm] = useState<EditFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);

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

  const togglePasswordEdit = () => {
    setIsPasswordEditable(prev => {
      const nextValue = !prev;

      if (!nextValue) {
        setForm(current => ({
          ...current,
          password: '',
          confirmPassword: '',
        }));
      }

      return nextValue;
    });
  };

  const renderInput = (
    label: string,
    field: keyof EditFormState,
    options?: {secureTextEntry?: boolean; editable?: boolean},
  ) => (
    <MyTextInput
      label={label}
      value={form[field]}
      onChangeText={value => updateForm(field, value)}
      secureTextEntry={options?.secureTextEntry}
      editable={options?.editable ?? true}
      autoCapitalize="none"
    />
  );

  const handleSave = async () => {
    if (isPasswordEditable && (!form.password.trim() || !form.confirmPassword.trim())) {
      Alert.alert(
        'Password required',
        'Password and confirm password cannot be empty.',
      );
      return;
    }

    if (isPasswordEditable && form.password !== form.confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Password and confirm password must match.',
      );
      return;
    }

    try {
      setIsSaving(true);
      await UpdateUserInfo(
        form.username,
        isPasswordEditable ? form.password : null,
        form.name,
        form.email,
      );
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

        {renderInput('Full Name', 'name')}
        {renderInput('Email', 'email')}

        <MyButton
          title={isPasswordEditable ? 'Lock Password Field' : 'Edit Password'}
          variant="secondary"
          onPress={togglePasswordEdit}
        />
        {renderInput('Password', 'password', {
          secureTextEntry: true,
          editable: isPasswordEditable,
        })}
        {renderInput('Confirm Password', 'confirmPassword', {
          secureTextEntry: true,
          editable: isPasswordEditable,
        })}

        <MyButton
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={isSaving}
        />

        <MyButton
          title="Cancel"
          variant="secondary"
          onPress={() => navigation.navigate('Profile', {username})}
        />
      </View>
    </ScrollView>
  );
};

export default EditScreen;
