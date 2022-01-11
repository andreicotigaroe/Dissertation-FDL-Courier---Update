import {createStore, applyMiddleware, combineReducers} from 'redux';
import {
  persistReducer,
} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import {
  createReducer as createNetworkReducer,
  createNetworkMiddleware} from 'react-native-offline';

import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';

// import routeReducer from "../reducers/route";
import rootSaga from '../sagas';
import {
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers';
// import mainReducer from "../reducers";

import authReducer from '../reducers/auth';
import routeReducer from '../reducers/route';
import pickupReducer from '../reducers/pickup';
import {RootNavigator} from '../../components/Navigation';
import NetworkTransform from './Transforms/NetworkTransform';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import { Platform } from 'react-native';

const middleware = createReactNavigationReduxMiddleware((state) => state.nav);
const sagaMiddleware = createSagaMiddleware();
const logger = createLogger();

// AsyncStorage.removeItem("persist:root");

AsyncStorage.getAllKeys().then((keys) => {
  console.log('AsyncStorage Keys:', keys);
});

const authConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['calling', 'callingMessage', 'fcmToken'],
};

const routeConfig = {
  key: 'route',
  storage: AsyncStorage,
  blacklist: ['calling', 'callingMessage'],
};

const pickupConfig = {
  key: 'pickup',
  storage: AsyncStorage,
};

const rootPersistConfig = {
  key: 'root',
  storage: Platform.OS === 'android' ? FilesystemStorage : AsyncStorage,
  whitelist: ['auth', 'route', 'pickup', 'network'],
  transforms: [NetworkTransform],
};

const navReducer = createNavigationReducer(RootNavigator);
const mainReducer = combineReducers({
  nav: navReducer,
  auth: persistReducer(authConfig, authReducer),
  route: persistReducer(routeConfig, routeReducer),
  pickup: persistReducer(pickupConfig, pickupReducer),
  network: createNetworkReducer((action, actionQueue) => undefined),
});

const networkMiddleware = createNetworkMiddleware({
  queueReleaseThrottle: 500,
});

const middlewares = [networkMiddleware, sagaMiddleware, thunk, middleware];

if (process.env.NODE_ENV === `development`) {
  // middlewares.push(logger);
}

export default configureStore = () => {
  const store = createStore(
    persistReducer(rootPersistConfig, mainReducer),
    {},
    applyMiddleware(...middlewares),
  );

  sagaMiddleware.run(rootSaga);

  return store;
};
