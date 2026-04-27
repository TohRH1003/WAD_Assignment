import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoginScreen from './screens/loginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NoteListScreen from './screens/NoteListScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditScreen from './screens/EditProfileScreen';
import NoteEditorScreen from './screens/NoteEditorScreen';
import {appStyles as styles} from './styles/AppStyles';
import {AuthTabParamList, RootStackParamList} from './AppStackTypes';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AuthTabParamList>();

const AuthTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Login"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          if (route.name === 'Login') {
            iconName = focused ? 'log-in' : 'log-in-outline';
          } else {
            iconName = focused ? 'person-add' : 'person-add-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Register" component={RegisterScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.screen}>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Auth" component={AuthTabs} />
          <Stack.Screen name="NoteList" component={NoteListScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Edit" component={EditScreen} />
          <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default App;
