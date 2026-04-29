import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {getUserByUsername} from '../DatabaseOperation/Authentication';
import {UpdateUserInfo} from '../DatabaseOperation/UpdateUser';
import {MyButton, MyTextInput} from '../components/MyCustomComponent';
import {appStyles as styles} from '../styles/AppStyles';

const EditScreen = ({navigation, route}: any) => {
  const {username} = route.params;
  const [formUsername, setFormUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUserByUsername(username);

        if (!user) {
          Alert.alert('User not found', 'Unable to load profile information.');
          navigation.navigate('MainDrawer', {
            screen: 'Profile',
            params: {username},
          });
          return;
        }

        setFormUsername(user.username);
        setPassword('');
        setConfirmPassword('');
        setName(user.name);
        setEmail(user.email);
      } catch (error: any) {
        Alert.alert('Load failed', error.message || 'Unable to load user.');
      }
    };

    loadUser();
  }, [navigation, username]);

  const togglePasswordEdit = () => {
    setIsPasswordEditable(prev => {
      const nextValue = !prev;

      if (!nextValue) {
        setPassword('');
        setConfirmPassword('');
      }

      return nextValue;
    });
  };

  const handleSave = async () => {
    if (isPasswordEditable && (!password.trim() || !confirmPassword.trim())) {
      Alert.alert(
        'Password required',
        'Password and confirm password cannot be empty.',
      );
      return;
    }

    if (isPasswordEditable && password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Password and confirm password must match.',
      );
      return;
    }

    try {
      setIsSaving(true);
      await UpdateUserInfo(
        formUsername,
        isPasswordEditable ? password : null,
        name,
        email,
      );
      Alert.alert('Profile updated', 'Your account details have been saved.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('Profile', {username: formUsername}),
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
        <MyTextInput
          label="Username"
          value={formUsername}
          onChangeText={setFormUsername}
          editable={false}
          autoCapitalize="none"
        />

        <MyTextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
        <MyTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <MyButton
          title={isPasswordEditable ? 'Lock Password Field' : 'Edit Password'}
          variant="secondary"
          onPress={togglePasswordEdit}
        />
        <MyTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={isPasswordEditable}
          autoCapitalize="none"
        />
        <MyTextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={isPasswordEditable}
          autoCapitalize="none"
        />

        <MyButton
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={isSaving}
        />

        <MyButton
          title="Cancel"
          variant="secondary"
          onPress={() =>
            navigation.navigate('MainDrawer', {
              screen: 'Profile',
              params: {username},
            })
          }
        />
      </View>
    </ScrollView>
  );
};

export default EditScreen;
