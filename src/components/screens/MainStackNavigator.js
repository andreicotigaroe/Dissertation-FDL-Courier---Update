import React, {useEffect, useState} from 'react';
import {View, Text, Alert, Platform} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import {NativeModules} from 'react-native';
import {offlineActionCreators} from 'react-native-offline';
import SystemSetting from 'react-native-system-setting';

import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';

import {createDrawerNavigator} from 'react-navigation-drawer';
import {createStackNavigator} from 'react-navigation-stack';

import ItineraryHomeScreen from './itinerary/ItineraryHomeScreen';
import TravelScreen from './itinerary/TravelScreen';
import DrawerContainer from './drawer/DrawerContainer';
import StartTravelScreen from './itinerary/StartTravelScreen';
import LoadParcelScreen from './itinerary/LoadParcelScreen';
import VerifyParcelScreen from './itinerary/VerifyParcelScreen';
import DeliveryStatusScreen from './itinerary/DeliveryStatusScreen';
import FailureFinishScreen from './itinerary/FailureFinishScreen';
import FinishWorkScreen from './itinerary/FinishWorkScreen';
import ParcelStateScreen from './itinerary/ParcelStateScreen';
import ShopHoursScreen from './itinerary/ShopHoursScreen';
import PickupOrdersScreen from './orders/PickupOrdersScreen';
import PickupOrderDetailsScreen from './orders/PickupOrderDetailsScreen';
import RecipientDetailsScreen from './itinerary/RecipientDetailsScreen';
import DropDeliveryScreen from './itinerary/DropDeliveryScreen';
import SelectDamagesScreen from './itinerary/SelectDamagesScreen';

import OfflineMarker from '../widgets/OfflineMarker';
import {connect} from 'react-redux';
import Waiting from '../widgets/Waiting';
import OrdersAfterArrivalScreen from './itinerary/OrdersAfterArrivalScreen';
import CameraScreen from './common/CameraScreen';
import ScanPickupParcelScreen from './orders/ScanPickupParcelScreen';
import SelectPickupDamagesScreen from './orders/SelectPickupDamagesScreen';
import FinishLoadingScreen from './itinerary/FinishLoadingScreen';
import VerifyCollectionsScreen from './itinerary/VerifyCollectionsScreen';
import CollectionStatusScreen from './itinerary/CollectionStatusScreen';
import SenderDetailsScreen from './itinerary/SenderDetailsScreen';
import CollectionFailureScreen from './itinerary/CollectionFailureScreen';
import FinishWorkLocationScreen from './itinerary/FinishWorkLocationScreen';
import VerifyReturnsScreen from './itinerary/VerifyReturnsScreen';
import ReturnStatusScreen from './itinerary/ReturnStatusScreen';
import ReturnDetailsScreen from './itinerary/ReturnDetailsScreen';
import ReturnFailureScreen from './itinerary/ReturnFailureScreen';
import WrongAddressCallScreen from './itinerary/WrongAddressCallScreen';
import {AppColors, AppFonts, HeaderStyle} from '~/assets/styles';
import SetRecipientLocation from './itinerary/SetRecipientLocation';
import {consts} from '~/assets/values';

const NetworkSettingModule = NativeModules.NetworkSettings;

const {changeQueueSemaphore} = offlineActionCreators;

const ItineraryStack = createStackNavigator(
  {
    ItineraryHome: {
      screen: ItineraryHomeScreen,
    },
    StartTravel: {
      screen: StartTravelScreen,
    },
    Travel: {
      screen: TravelScreen,
    },
    LoadParcel: {
      screen: LoadParcelScreen,
    },
    SelectDamages: {
      screen: SelectDamagesScreen,
    },
    FinishLoading: {
      screen: FinishLoadingScreen,
    },
    ParcelState: {
      screen: ParcelStateScreen,
    },
    VerifyCollections: {
      screen: VerifyCollectionsScreen,
    },
    VerifyParcel: {
      screen: VerifyParcelScreen,
    },
    CollectionStatus: {
      screen: CollectionStatusScreen,
    },
    CollectionFailure: {
      screen: CollectionFailureScreen,
    },
    DeliveryStatus: {
      screen: DeliveryStatusScreen,
    },
    SenderDetails: {
      screen: SenderDetailsScreen,
    },
    RecipientDetails: {
      screen: RecipientDetailsScreen,
    },
    ReturnDetails: {
      screen: ReturnDetailsScreen,
    },
    ReturnFailure: {
      screen: ReturnFailureScreen,
    },
    DropDelivery: {
      screen: DropDeliveryScreen,
    },
    VerifyReturns: {
      screen: VerifyReturnsScreen,
    },
    ReturnStatus: {
      screen: ReturnStatusScreen,
    },
    FailureFinish: {
      screen: FailureFinishScreen,
    },
    FinishWorkLocation: {
      screen: FinishWorkLocationScreen,
    },
    FinishWork: {
      screen: FinishWorkScreen,
    },
    ShopHours: {
      screen: ShopHoursScreen,
    },
    OrdersAfterArrival: {
      screen: OrdersAfterArrivalScreen,
    },
    Camera: {
      screen: CameraScreen,
    },
    WrongAddressCall: {
      screen: WrongAddressCallScreen,
      navigationOptions: {
        title: 'Wrong Address',
      },
    },
    SetRecipientLocation: {
      screen: SetRecipientLocation,
      navigationOptions: {
        title: "Recipient's Location",
      },
    },
    // ParcelVerification: {
    //     screen: ParcelVerificationScreen
    // }
  },
  {
    initialRouteName: 'ItineraryHome',
    headerMode: 'float',
    defaultNavigationOptions: {
      ...HeaderStyle,
      headerTitleAlign: 'center',
    },
  },
);

class ItineraryStackNavigator extends React.Component {
  static router = ItineraryStack.router;
  render() {
    const {navigation, network} = this.props;
    return (
      <View style={{flex: 1}}>
        <ItineraryStack navigation={navigation} />
        <Waiting
          visible={network && network.isQueuePaused && network.isConnected}
          title={'Submitting data to the platform...'}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  network: state.network,
});

const OrdersStack = createStackNavigator(
  {
    PickupOrders: {
      screen: PickupOrdersScreen,
    },
    ScanPickupParcel: {
      screen: ScanPickupParcelScreen,
    },
    SelectPickupDamages: {
      screen: SelectPickupDamagesScreen,
    },
  },
  {
    initialRouteName: 'PickupOrders',
    headerMode: 'float',
    defaultNavigationOptions: {
      headerTitleAlign: 'center',
    },
  },
);

// drawer stack
const DrawerStack = createDrawerNavigator(
  {
    ItineraryStack: {
      screen: connect(mapStateToProps)(ItineraryStackNavigator),
      navigationOptions: {
        drawerLockMode: 'locked-closed',
      },
    },
    OrdersStack: {
      screen: OrdersStack,
      navigationOptions: {
        drawerLockMode: 'locked-closed',
      },
    },
  },
  {
    drawerPosition: 'left',
    initialRouteName: 'ItineraryStack',
    drawerWidth: 290,
    contentComponent: DrawerContainer,
    headerMode: 'screen',
    navigationOptions: ({navigation}) => {
      const routeIndex = navigation.state.index;
      return {
        title: navigation.state.routes[routeIndex].key,
        headerShown: false,
        headerBackTitle: null,
      };
    },
  },
);

const DrawerStackNavigator = (props) => {
  const {network, route} = useSelector((state) => state);
  const {navigation} = props;
  const [networkStatus, setNetworkStatus] = useState(0); // 0: Normal, 1: Normal Offline, 2: Airplane, 3: Manually switch off mobile data, 4: Wifi
  const dispatch = useDispatch();

  useEffect(() => {
    async function checkConnectivity() {
      if (network.isConnected) {
        if (route.status !== consts.ROUTE_STATUS.CREATED) {
          NetInfo.fetch().then((state) => {
            if (state.type === 'wifi') {
              setNetworkStatus(4);
            } else {
              setNetworkStatus(0);
            }
          });
        } else {
          setNetworkStatus(0);
        }
      } else {
        if (Platform.OS === 'android') {
          const airplaneMode = DeviceInfo.isAirplaneModeSync();
          if (airplaneMode) setNetworkStatus(2);
          else if (
            NetworkSettingModule &&
            NetworkSettingModule.isMobileDataEnabled() === false
          )
            setNetworkStatus(3);
          else setNetworkStatus(1);
        } else {
          const airplaneMode = await SystemSetting.isAirplaneEnabled();
          if (airplaneMode) setNetworkStatus(2);
          else setNetworkStatus(1);
        }
      }
    }
    checkConnectivity();
  }, [network.isConnected]);

  useEffect(() => {}, []);

  useEffect(() => {
    console.log('Network:', network);
  }, [network]);

  return networkStatus === 0 ? (
    <View style={{flex: 1}}>
      <DrawerStack navigation={navigation} />
    </View>
  ) : networkStatus === 2 ? (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
      <Ionicon
        size={72}
        color={AppColors.grey2}
        name="airplane"
        style={{marginBottom: 20}}
      />
      <Text
        style={{
          color: AppColors.grey,
          fontFamily: AppFonts.main.medium,
          fontSize: 16,
          lineHeight: 30,
          textAlign: 'center',
        }}>
        We can see you have just boarded a plane. We wish you a pleasant flight.
        Please, once you land, continue to deliver
      </Text>
    </View>
  ) : networkStatus === 3 ? (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
      <MaterialCommunityIcon
        size={72}
        color={AppColors.grey2}
        name="signal-off"
        style={{marginBottom: 20}}
      />
      <Text
        style={{
          color: AppColors.grey,
          fontFamily: AppFonts.main.medium,
          fontSize: 16,
          lineHeight: 30,
          textAlign: 'center',
        }}>
        We can see you have switched off your mobile data. Unfortunately, I am
        little robot that can only function with Internet. Please switch on your
        mobile data to continue delivering
      </Text>
    </View>
  ) : networkStatus === 4 ? (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
      <MaterialCommunityIcon
        size={72}
        color={AppColors.grey2}
        name="wifi"
        style={{marginBottom: 20}}
      />
      <Text
        style={{
          color: AppColors.grey,
          fontFamily: AppFonts.main.medium,
          fontSize: 16,
          lineHeight: 30,
          textAlign: 'center',
        }}>
        Unfortunately, we cannot allow you to use WiFi , because this affects
        the effectiveness of the location. Please de-activate WiFi in order to
        continue.
      </Text>
    </View>
  ) : (
    <View style={{flex: 1}}>
      <DrawerStack navigation={navigation} />
      <OfflineMarker />
    </View>
  );
};

DrawerStackNavigator.router = DrawerStack.router;

const MainStack = createStackNavigator(
  {
    DrawerStack: {
      screen: connect(mapStateToProps)(DrawerStackNavigator),
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

export default class MainStackNavigator extends React.Component {
  static router = MainStack.router;
  render() {
    const {navigation} = this.props;
    return (
      <View style={{flex: 1}}>
        <MainStack navigation={navigation} />
      </View>
    );
  }
}
