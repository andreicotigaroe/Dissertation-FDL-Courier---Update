import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Alert, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';
import {setFcmToken} from '~/redux/actions/auth';
import {store} from '~/../App';
import ShipmentApi from '../api/ShipmentApi';
import {setRoute} from '~/redux/actions/route';

class NotificationManager {
  configure = () => {
    PushNotification.configure({
      onRegister: function (data) {
        console.log('TOKEN:', data);
        store.dispatch(setFcmToken(data.token));
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);

        const state = store.getState();
        ShipmentApi.getRoute(state.auth.token)
          .then((response) => {
            store.dispatch(setRoute(response.data));
          })
          .catch((error) => {
            Alert.alert(
              'Error',
              'The status of an order changed by a manager but reloading failed',
            );
          });
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
    PushNotification.createChannel(
      {
        channelId: 'fdl_driver_notification_channel', // (required)
        channelName: 'FDL Driver', // (required)
      },
      (created) => console.log(`createChannel returned '${created}`),
    );
  };

  buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
    return {
      id: id,
      autoCancel: true,
      largeIcon: options.largeIcon || 'ic_launcher',
      smallIcon: options.smallIcon || 'ic_launcher',
      bigText: message || '',
      subText: title || '',
      vibration: options.vibration || 300,
      vibrate: options.vibrate || false,
      priority: options.priority || 'high',
      importance: options.importance || 'high',
      data: data,
    };
  };
  buildIOSNotification = (id, title, message, data = {}, options = {}) => {
    return {
      alertAction: options.alertAction || 'view',
      category: options.category || '',
      userInfo: {
        id: id,
        item: data,
      },
    };
  };
  cancelAllNotification = () => {
    console.log('cancel');
    PushNotification.cancelAllLocalNotifications();
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeAllDeliveredNotifications();
    }
  };

  showNotification = (id, title, message, data = {}, options = {}, date) => {
    PushNotification.localNotificationSchedule({
      //Android
      ...this.buildAndroidNotification(id, title, message, data, options),

      // iOS
      ...this.buildIOSNotification(id, title, message, data, options),

      // Android and iOS
      title: title || '',
      message: message || '',
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      date: date,
    });
  };
  unregister = () => {
    PushNotification.unregister();
  };
}
export const notificationManager = new NotificationManager();
