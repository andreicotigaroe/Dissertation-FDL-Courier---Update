/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {ReduxNetworkProvider, NetworkProvider} from 'react-native-offline';
import {AppStyles} from './src/assets/styles';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/components/Navigation';
import {MenuProvider} from 'react-native-popup-menu';
import 'react-native-gesture-handler';
import configureStore from './src/redux/store';
import {offlineActionCreators} from 'react-native-offline';

import {PersistGate} from 'redux-persist/integration/react';
import {persistStore} from 'redux-persist';
// import { store, persistor } from './src/redux/store';

const {changeQueueSemaphore} = offlineActionCreators;

console.disableYellowBox = true;

export const store = configureStore();

let persistor = persistStore(store, null, () => {
  store.dispatch(changeQueueSemaphore('RED'));
});

const App: () => React$Node = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MenuProvider>
          <AppNavigator />
        </MenuProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
