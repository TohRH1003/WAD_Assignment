import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {initializeDatabase, InsertUser} from '../DatabaseOperation/InsertValue';
import {MyButton, MyTextInput} from '../components/MyCustomComponent';
import {appStyles as styles} from '../styles/AppStyles';

type RegisterFormState = {
  username: string;
  password: string;
  name: string;
  email: string;
};

const emptyForm: RegisterFormState = {
  username: '',
  password: '',
  name: '',
  email: '',
};

const RegisterScreen = ({navigation}: any) => {
  const [form, setForm] = useState<RegisterFormState>(emptyForm);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const updateForm = (field: keyof RegisterFormState, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleRegister = async () => {
    try {
      setIsAuthSubmitting(true);
      await InsertUser(form.username, form.password, form.name, form.email);
      Alert.alert(
        'Account created',
        'Your account has been created successfully.',
      );
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert(
        'Create account failed',
        'User with the same username already exists.',
      );
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Note Taking App</Text>

      <View style={styles.card}>
        <MyTextInput
          label="Username"
          value={form.username}
          onChangeText={value => updateForm('username', value)}
          autoCapitalize="none"
        />

        <MyTextInput
          label="Password"
          value={form.password}
          onChangeText={value => updateForm('password', value)}
          secureTextEntry
          autoCapitalize="none"
        />

        <MyTextInput
          label="Full Name"
          value={form.name}
          onChangeText={value => updateForm('name', value)}
        />

        <MyTextInput
          label="Email"
          value={form.email}
          onChangeText={value => updateForm('email', value)}
          autoCapitalize="none"
        />

        <MyButton
          title={isAuthSubmitting ? 'Please wait...' : 'Create Account'}
          onPress={handleRegister}
          disabled={isAuthSubmitting}
        />

        <MyButton
          title="Already have an account? Log In"
          variant="link"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
