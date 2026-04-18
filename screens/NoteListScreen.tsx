import React from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {RootStackParamList} from '../AppStackTypes';
import {appStyles as styles} from '../styles/AppStyles';

const NoteListScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'NoteList'>>();
  const {username} = route.params;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.noteScreenHeader}>
        <View>
          <Text style={styles.title}>My Note</Text>
          <Text style={styles.subtitle}>Welcome, {username}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerGuideButton}
          onPress={() => navigation.navigate('Profile', {username})}
          activeOpacity={0.8}>
          <Text style={styles.headerGuideButtonText}>User Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.noteItem}>
          <Text style={styles.noteItemTitle}>Sample Note 1</Text>
          <Text style={styles.noteItemMeta}>
            Just the text, does not has real function yet
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default NoteListScreen;
