import {connect} from 'react-redux';
import {createReduxContainer} from 'react-navigation-redux-helpers';
import {createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import LoginScreen from './screens/auth/LoginScreen';
import LoadScreen from './screens/auth/LoadScreen';
import MainStackNavigator from './screens/MainStackNavigator';

const LoginStack = createStackNavigator(
  {
    Login: {
      screen: LoginScreen,
      navigationOptions: () => ({
        headerShown: false,
        // headerStyle: authScreensStyles.headerStyle
      }),
    },
  },
  {
    initialRouteName: 'Login',
    headerMode: 'float',
    // headerMode: "none",
    //cardShadowEnabled: false
  },
);

const MainNavigator = createStackNavigator(
  {
    DrawerStack: {
      screen: MainStackNavigator,
      navigationOptions: {headerShown: false},
    },
  },
  {
    // Default config for all screens
    headerMode: 'float',
    initialRouteName: 'DrawerStack',
    navigationOptions: ({navigation}) => ({
      headerTintColor: '#27acb1',
      // headerTitleStyle: styles.headerTitleStyle
    }),
  },
);

const RootNavigator = createSwitchNavigator(
  {
    // ItineraryStack: ItineraryStack,
    LoadScreen: LoadScreen,
    LoginStack: LoginStack,
    MainStack: MainNavigator,
  },
  {
    initialRouteName: 'LoadScreen',
    headerMode: 'float',
    headerLayoutPreset: 'center',
  },
);

const AppContainer = createReduxContainer(RootNavigator);
const mapStateToProps = (state) => ({
  state: state.nav,
});
const AppNavigator = connect(mapStateToProps)(AppContainer);

export {RootNavigator, AppNavigator};
