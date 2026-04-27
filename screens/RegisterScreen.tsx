import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {initializeDatabase, InsertUser} from '../DatabaseOperation/InsertValue';
import {MyButton, MyTextInput} from '../components/MyCustomComponent';
import {appStyles as styles} from '../styles/AppStyles';

const RegisterScreen = ({navigation}: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const handleRegister = async () => {
    try {
      setIsAuthSubmitting(true);
      await InsertUser(username, password, name, email);
      Alert.alert(
        'Account created',
        'Your account has been created successfully.',
      );
      setUsername('');
      setPassword('');
      setName('');
      setEmail('');
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
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <MyTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <MyTextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
        />

        <MyTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
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
