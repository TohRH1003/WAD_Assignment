import React, {useCallback, useState} from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getUserByUsername} from '../DatabaseOperation/Authentication';
import GuideModal from '../components/GuideModal';
import {MyButton} from '../components/MyCustomComponent';
import QuoteCard from '../components/QuoteCard';
import {getAppGuide, getDailyQuote} from '../services/cloudService';
import {appStyles as styles} from '../styles/AppStyles';

type QuoteInfo = {
  day: string;
  quote: string;
};

type GuideInfo = {
  title: string;
  steps: string[];
};

const ProfileScreen = ({navigation, route}: any) => {
  const {username} = route.params;
  const [profileUsername, setProfileUsername] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileCreatedAt, setProfileCreatedAt] = useState('');
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null);
  const [guideInfo, setGuideInfo] = useState<GuideInfo | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const formattedCreatedAt = profileCreatedAt
    ? (() => {
        const date = new Date(profileCreatedAt);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      })()
    : '';

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
            navigation.navigate('Auth', {screen: 'Login'});
            return;
          }

          setProfileUsername(user.username);
          setProfileName(user.name);
          setProfileEmail(user.email);
          setProfileCreatedAt(user.create_at);
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
          setProfileUsername('');
          setProfileName('');
          setProfileEmail('');
          setProfileCreatedAt('');
          navigation.navigate('Auth', {screen: 'Login'});
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeaderRow}>
          <View style={styles.pageHeaderTextWrap}>
            <Text style={styles.title}>User Profile</Text>
          </View>
          <MyButton
            title={isGuideLoading ? 'Loading...' : 'Guide'}
            variant="header"
            onPress={handleOpenGuide}
            disabled={isGuideLoading}
          />
        </View>
        <QuoteCard isLoading={isLoadingQuote} quoteInfo={quoteInfo} />

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.readonlyValue}>{profileUsername}</Text>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.readonlyValue}>{profileName}</Text>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.readonlyValue}>{profileEmail}</Text>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Created Date</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.readonlyValue}>{formattedCreatedAt}</Text>
            </View>
          </View>

          <MyButton
            title="Edit Profile"
            onPress={() =>
              navigation.navigate('Edit', {username: profileUsername})
            }
          />

          <MyButton
            title="Back To Notes"
            variant="secondary"
            onPress={() =>
              navigation.navigate('NoteList', {username: profileUsername})
            }
          />

          <MyButton title="Log Out" variant="link" onPress={handleLogout} />
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
