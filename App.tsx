import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaView} from 'react-native';
import LoginScreen from './screens/loginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NoteListScreen from './screens/NoteListScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditScreen from './screens/EditProfileScreen';
import {appStyles as styles} from './styles/AppStyles';
import {RootStackParamList} from './AppStackTypes';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.screen}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="NoteList" component={NoteListScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Edit" component={EditScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;
