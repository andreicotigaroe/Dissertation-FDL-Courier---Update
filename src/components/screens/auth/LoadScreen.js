import React, {useState} from 'react';
import {View, Alert, Image, AppState, Platform, Linking} from 'react-native';
import {connect, useDispatch, useSelector} from 'react-redux';
import {
  offlineActionCreators,
  checkInternetConnection,
} from 'react-native-offline';
import Orientation from 'react-native-orientation-locker';
import KeepAwake from 'react-native-keep-awake';
import {DotIndicator} from 'react-native-indicators';

import AuthApi from '~/services/api/AuthApi';
import {AppColors} from '~/assets/styles';
// import { localNotificationService } from "~/services/notification/LocalNotificationService";
import SplashScreen from 'react-native-splash-screen';
import {sagaGetAuthUser, sagaLogout} from '~/redux/sagas/auth';
import {sagaSetRoute} from '~/redux/sagas/route';
import appVersion from '~/redux/store/helpers/AppVersion';
import {compareVersions} from '~/utils';
import {useEffect} from 'react';


const {changeQueueSemaphore} = offlineActionCreators;

const LoadScreen = (props) => {
  const {
    auth: {user, token, fcmToken},
  } = useSelector((state) => state);
  const {network} = props;
  const dispatch = useDispatch();
  const {navigation} = props;

  const [loginSucceeded, setLoginSucceeded] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      SplashScreen.hide();
    }
  };

  useEffect(() => {
    if (loginSucceeded && fcmToken && token) {
      AuthApi.registerFCMToken(fcmToken, token)
        .then((response) => {
          console.log('[LoadScreen] succeeded registering FCM token');
        })
        .catch((error) => {
          console.log('[LoadScreen] failed registering FCM token');
        });
    }
  }, [fcmToken, token, loginSucceeded]);

  useEffect(() => {
    if (checkingConnection) return;

    console.log("Checking Connection Finished");

    SplashScreen.hide();
    Orientation.lockToPortrait();
    KeepAwake.activate();

    AppState.addEventListener('change', handleAppStateChange);

    const authToken = token;

    console.log('[LoadScreen::componentDidMount] User Auth Token:', authToken);

    if (authToken) {
      if (!network.isConnected) {
        navigation.navigate('ItineraryStack');
      } else {
        dispatch(
          sagaGetAuthUser(authToken, {
            onSuccess: () => {
              // console.log("[LoadScreen::componentDidMount] User Data:", userData);
              setLoginSucceeded(true);
              dispatch(sagaSetRoute());
              dispatch(changeQueueSemaphore('GREEN'));
              navigation.navigate('ItineraryStack');
              AuthApi.registerAppInfo(appVersion, authToken)
                .then((response) => {})
                .catch((error) => {
                  if (error.response) {
                    const {data} = error.response;
                    if (error.response.status === 400) {
                      Alert.alert(
                        'New Version Available',
                        `The new version ${
                          data.version
                        } of the app is available on ${
                          Platform.OS === 'android' ? 'Play' : 'App'
                        } Store. Your current version is ${appVersion}. Do you want to upgrade it?`,
                        [
                          {
                            text: 'NO',
                            onPress: () => {
                              navigation.navigate('LoginStack');
                              setTimeout(() => {
                                dispatch(sagaLogout());
                              }, 2000);
                            },
                          },
                          {
                            text: 'YES',
                            onPress: () => {
                              navigation.navigate('LoginStack');
                              setTimeout(() => {
                                dispatch(sagaLogout());
                              }, 2000);
                              if (Platform.OS === 'android')
                                Linking.openURL('market://details?id=com.fdl.driver');
                              else
                                Linking.openURL('https://apps.apple.com/id/app/fdl-driver/id1534294833');
                            },
                          },
                        ],
                      );
                    }
                  }
                });
            },
            onFailure: (err) => {
              navigation.navigate('LoginStack');
            },
          }),
        );
      }
    } else {
      navigation.navigate('LoginStack');
      AuthApi.getAppInfo().then((response) => {
        const data = response.data;
        if (compareVersions(appVersion, data.version) < 0) {
          Alert.alert(
            'New Version Available',
            `The new version ${data.version} of the app is available on ${
              Platform.OS === 'android' ? 'Play' : 'App'
            } Store. Your current version is ${appVersion}. Do you want to upgrade it?`,
            [
              {
                text: 'NO',
                style: 'cancel',
              },
              {
                text: 'YES',
                onPress: () => {
                  if (Platform.OS === 'android')
                    Linking.openURL('market://details?id=com.fdl.driver');
                  else
                    Linking.openURL('https://apps.apple.com/id/app/fdl-driver/id1534294833');
                },
              },
            ],
          );
        }
      });
    }
  }, [checkingConnection]);

  useEffect(() => {
    async function checkConnection() {
      const {connectionChange} = offlineActionCreators;
      const isConnected = await checkInternetConnection('https://courier.fdll.uk/api/ping/');
      dispatch(connectionChange(isConnected));
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCheckingConnection(false);
    }
    checkConnection();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: AppColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        source={require('../../../assets/images/drawer_title_bg1.png')}
        style={{width: 150, height: 150, resizeMode: 'contain', opacity: 0.5}}
      />
      <View style={{height: 50}}>
        <DotIndicator color="white" size={8} />
      </View>
    </View>
  );
};

LoadScreen.navigationOptions = {
  headerShown: false,
};

const mapStateToProps = (state) => ({
  network: state.network,
});

export default connect(mapStateToProps)(LoadScreen);
