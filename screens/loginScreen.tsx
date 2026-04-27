import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {loginUser} from '../DatabaseOperation/Authentication';
import {initializeDatabase} from '../DatabaseOperation/InsertValue';
import {MyButton, MyTextInput} from '../components/MyCustomComponent';
import QuoteCard from '../components/QuoteCard';
import {getDailyQuote} from '../services/cloudService';
import {appStyles as styles} from '../styles/AppStyles';

type QuoteInfo = {
  day: string;
  quote: string;
};

const LoginScreen = ({navigation}: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);

  useEffect(() => {
    const loadQuote = async () => {
      try {
        setIsLoadingQuote(true);
        const quote = await getDailyQuote();
        setQuoteInfo(quote);
      } catch (error) {
        console.log('Quote load error:', error);
        setQuoteInfo(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    initializeDatabase();
    loadQuote();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setUsername('');
      setPassword('');
    }, []),
  );

  const handleLogin = async () => {
    try {
      setIsAuthSubmitting(true);
      const user = await loginUser(username, password);

      if (!user) {
        Alert.alert('Login failed', 'Invalid username or password.');
        return;
      }

      navigation.navigate('NoteList', {username: user.username});
    } catch (error: any) {
      Alert.alert('Login failed', error.message || 'Please try again.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Note Taking App</Text>
      <QuoteCard isLoading={isLoadingQuote} quoteInfo={quoteInfo} />

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

        <MyButton
          title={isAuthSubmitting ? 'Please wait...' : 'Log In'}
          onPress={handleLogin}
          disabled={isAuthSubmitting}
        />

        <MyButton
          title="Don't have an account? Create Account"
          variant="link"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
