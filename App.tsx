import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NoteListScreen from './screens/NoteListScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditScreen from './screens/EditProfileScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import MindMapScreen from './screens/MindMapScreen';
import { appStyles as styles } from './styles/AppStyles';
import { RootStackParamList } from './AppStackTypes';
import { NoteProvider } from './context/NoteContext';
import {useContext} from 'react';
import {NoteContext} from './context/NoteContext';

const {notes, addNote, deleteNote, isLoading, error} =
   useContext(NoteContext);

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NoteProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.screen}>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="NoteList" component={NoteListScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Edit" component={EditScreen} />
            <Stack.Screen name="AddNote" component={AddNoteScreen} />
            <Stack.Screen name="MindMap" component={MindMapScreen} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </NoteProvider>

  );
};

export default App;
