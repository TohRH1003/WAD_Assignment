import React, {useState} from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CommonActions,
  DrawerActions,
  NavigationContainer,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoginScreen from './screens/loginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NoteListScreen from './screens/NoteListScreen';
import FolderListScreen from './screens/FolderListScreen'; //added folder list
import ProfileScreen from './screens/ProfileScreen';
import EditScreen from './screens/EditProfileScreen';
import NoteEditorScreen from './screens/NoteEditorScreen';
import GuideModal from './components/GuideModal';
import {getAppGuide} from './services/cloudService';
import {appStyles as styles} from './styles/AppStyles';
import {
  AuthTabParamList,
  MainDrawerParamList,
  RootStackParamList,
} from './AppStackTypes';
import MindMapScreen from './screens/MindMapScreen';
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AuthTabParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

const AuthTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Login"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
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

type GuideInfo = {
  title: string;
  steps: string[];
};

const AppDrawerContent = (props: any) => {
  const [guideInfo, setGuideInfo] = useState<GuideInfo | null>(null);
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);

  const handleOpenGuide = async () => {
    try {
      setIsGuideLoading(true);
      const guide = await getAppGuide();
      setGuideInfo(guide);
      setIsGuideVisible(true);
      props.navigation.dispatch(DrawerActions.closeDrawer());
    } catch (error) {
      console.log('Guide load error:', error);
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
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          const parentNavigation = props.navigation.getParent();
          parentNavigation?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Auth', params: {screen: 'Login'}}],
            }),
          );
        },
      },
    ]);
  };

  return (
    <>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={drawerStyles.scrollContent}>
        <DrawerItemList {...props} />
        <View style={drawerStyles.actionGroup}>
          <TouchableOpacity
            style={drawerStyles.actionButton}
            onPress={handleOpenGuide}
            disabled={isGuideLoading}>
            <Ionicons name="help-circle-outline" size={20} color="#1f2937" />
            <Text style={drawerStyles.actionText}>
              {isGuideLoading ? 'Loading Guide...' : 'Guide'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={drawerStyles.actionButton}
            onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
            <Text style={[drawerStyles.actionText, drawerStyles.logoutText]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      <GuideModal
        guideInfo={guideInfo}
        visible={isGuideVisible}
        onClose={() => setIsGuideVisible(false)}
      />
    </>
  );
};

const MainDrawer = ({route}: any) => {
  const username =
    route.params?.params?.username ?? route.params?.username ?? '';

  return (
    <Drawer.Navigator
      drawerContent={props => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#3dc9f3',
      }}>
      <Drawer.Screen
        name="NoteList"
        component={NoteListScreen}
        initialParams={{username}}
        options={{
          title: 'My Notes',
          drawerIcon: ({color, size}) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{username}}
        options={{
          title: 'Profile',
          drawerIcon: ({color, size}) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="FolderList"
        component={FolderListScreen}
        initialParams={{username}}
        options={{
          title: 'Folders',
          drawerIcon: ({color, size}) => (
            <Ionicons name="folder-open-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.screen}>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthTabs} />
          <Stack.Screen name="MainDrawer" component={MainDrawer} />
          <Stack.Screen name="Edit" component={EditScreen} />
          <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
          <Stack.Screen name="MindMap" component={MindMapScreen} options={{ title: 'Visual Mind Map' }}/>
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

const drawerStyles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  actionGroup: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 16,
    paddingTop: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutText: {
    color: '#b91c1c',
  },
});

export default App;
