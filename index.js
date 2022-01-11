/**
 * @format
 */

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {AppRegistry} from 'react-native';
import PushNotification from 'react-native-push-notification';
import App from './App';
import {name as appName} from './app.json';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';

import Geocoder from 'react-native-geocoding';
import AppConfig from '~/config';
import { notificationManager } from '~/services/notification/NotificationManager';

Geocoder.init(AppConfig.GOOGLE_API_KEY);

notificationManager.configure();

AppRegistry.registerComponent(appName, () => gestureHandlerRootHOC(App));
