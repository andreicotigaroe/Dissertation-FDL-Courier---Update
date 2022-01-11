import { all, fork } from 'redux-saga/effects';

import authSaga from "./auth";
import routeSaga from "./route";
import { networkSaga } from 'react-native-offline';

export default function* rootSaga() {
    yield all([
        authSaga(),
        routeSaga(),
        fork(networkSaga, { pingInterval: 10000, pingServerUrl: 'https://courier.fdll.uk/api/ping/' }),
    ])
}