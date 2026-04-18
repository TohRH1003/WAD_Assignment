import React, {useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {initializeDatabase, InsertUser} from '../DatabaseOperation/InsertValue';
import QuoteCard from '../components/QuoteCard';
import {getDailyQuote} from '../services/cloudService';
import {RootStackParamList} from '../AppStackTypes';
import {appStyles as styles} from '../styles/AppStyles';

type QuoteInfo = {
  day: string;
  quote: string;
};

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

const RegisterScreen = ({navigation}:any) => {
  const [form, setForm] = useState<RegisterFormState>(emptyForm);
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            value={form.name}
            onChangeText={value => updateForm('name', value)}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={value => updateForm('email', value)}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={isAuthSubmitting}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>
            {isAuthSubmitting ? 'Please wait...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}>
          <Text style={styles.subtitle}>
            Already have an account? <Text style={styles.subtitle}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
