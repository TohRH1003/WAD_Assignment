import React, {useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {loginUser} from '../DatabaseOperation/Authentication';
import {initializeDatabase} from '../DatabaseOperation/InsertValue';
import QuoteCard from '../components/QuoteCard';
import {getDailyQuote} from '../services/cloudService';
import {appStyles as styles} from '../styles/AppStyles';

type QuoteInfo = {
  day: string;
  quote: string;
};

type LoginFormState = {
  username: string;
  password: string;
};

const emptyForm: LoginFormState = {
  username: '',
  password: '',
};

const LoginScreen = ({navigation}: any) => {
  const [form, setForm] = useState<LoginFormState>(emptyForm);
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
      setForm(emptyForm);
    }, []),
  );

  const updateForm = (field: keyof LoginFormState, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleLogin = async () => {
    try {
      setIsAuthSubmitting(true);
      const user = await loginUser(form.username, form.password);

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
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            value={form.username}
            onChangeText={value => updateForm('username', value)}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            value={form.password}
            onChangeText={value => updateForm('password', value)}
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={isAuthSubmitting}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>
            {isAuthSubmitting ? 'Please wait...' : 'Log In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}>
          <Text style={styles.subtitle}>
            Don't have an account?{' '}
            <Text style={styles.subtitle}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
