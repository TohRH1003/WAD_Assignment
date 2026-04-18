import React, {useCallback, useState} from 'react';
import {Alert, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {getUserByUsername} from '../DatabaseOperation/Authentication';
import GuideModal from '../components/GuideModal';
import QuoteCard from '../components/QuoteCard';
import {getAppGuide, getDailyQuote} from '../services/cloudService';
import {RootStackParamList} from '../AppStackTypes';
import {appStyles as styles} from '../styles/AppStyles';

type QuoteInfo = {
  day: string;
  quote: string;
};

type GuideInfo = {
  title: string;
  steps: string[];
};

type UserProfile = {
  username: string;
  name: string;
  email: string;
};

const emptyProfile: UserProfile = {
  username: '',
  name: '',
  email: '',
};

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Profile'>>();
  const {username} = route.params;
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null);
  const [guideInfo, setGuideInfo] = useState<GuideInfo | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const user = await getUserByUsername(username);

          if (!user) {
            Alert.alert(
              'User not found',
              'Unable to load profile information.',
            );
            navigation.navigate('Login');
            return;
          }

          setProfile({
            username: user.username,
            name: user.name,
            email: user.email,
          });
        } catch (error: any) {
          Alert.alert(
            'Load failed',
            error.message || 'Unable to load profile.',
          );
        }
      };

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

      loadProfile();
      loadQuote();
    }, [navigation, username]),
  );

  const handleOpenGuide = async () => {
    try {
      setIsGuideLoading(true);
      const guide = await getAppGuide();
      setGuideInfo(guide);
      setIsGuideVisible(true);
    } catch (error: any) {
      console.log('Guide load error:', error);
      setGuideInfo(null);
      setIsGuideVisible(false);
      Alert.alert(
        'Connection error',
        'Unable to connect to the server for the guide.',
      );
    } finally {
      setIsGuideLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          setProfile(emptyProfile);
          navigation.navigate('Login');
        },
      },
    ]);
  };

  const renderInfoRow = (label: string, value: string) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputDisabled}>
        <Text style={styles.readonlyValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeaderRow}>
          <View style={styles.pageHeaderTextWrap}>
            <Text style={styles.title}>User Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.headerGuideButton}
            onPress={handleOpenGuide}
            disabled={isGuideLoading}
            activeOpacity={0.8}>
            <Text style={styles.headerGuideButtonText}>
              {isGuideLoading ? 'Loading...' : 'Guide'}
            </Text>
          </TouchableOpacity>
        </View>
        <QuoteCard isLoading={isLoadingQuote} quoteInfo={quoteInfo} />

        <View style={styles.card}>
          {renderInfoRow('Username', profile.username)}
          {renderInfoRow('Full Name', profile.name)}
          {renderInfoRow('Email', profile.email)}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate('Edit', {username: profile.username})
            }
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('NoteList', {username: profile.username})
            }
            activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Back To Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Text style={styles.linkButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GuideModal
        guideInfo={guideInfo}
        visible={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
      />
    </>
  );
};

export default ProfileScreen;
