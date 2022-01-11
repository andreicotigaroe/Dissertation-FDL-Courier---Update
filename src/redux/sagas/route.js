import {fork, all, takeLatest, call, put} from 'redux-saga/effects';
import ShipmentApi from '../../services/api/ShipmentApi';
import {
  setCurrentStop,
  setRequestCalling,
  setRequestFailure,
  setRoute,
  Types as RouteTypes,
  setStopStatus,
  submitDeliverySuccess,
  setShopHours,
  submitDeliveryFailure,
  submitCollectionSuccess,
  submitCollectionFailure,
  submitReturnSuccess,
  reportWrongAddress,
  initRoute,
  submitReturnFailure,
} from '../actions/route';
import {store} from '../../../App';

// ---------------------- initRoute Saga ------------------------
const API_INIT_ROUTE = 'API_INIT_ROUTE';
export const sagaInitRoute = () => ({
  type: API_INIT_ROUTE,
});

function* sagaInitRouteEffect() {
  console.log('sagaInitRouteEffect');
  try {
    const state = store.getState();
    yield put(initRoute());
  } catch (err) {}
}

// ---------------------- setCurrentStop Saga ------------------------
const API_SET_CURRENT_STOP = 'API_SET_CURRENT_STOP';
export const sagaSetCurrentStop = (stopId, location, kwargs = {}) => ({
  type: API_SET_CURRENT_STOP,
  payload: {
    stopId,
    location,
    kwargs,
  },
});

function* sagaSetCurrentStopEffect(action) {
  try {
    const state = store.getState();

    yield put(setCurrentStop(action.payload.stopId, action.payload.location));

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());
    console.log('Error:', err);

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- setRoute Saga ------------------------
const API_SET_ROUTE = 'API_SET_ROUTE';
export const sagaSetRoute = (kwargs = {}) => ({
  type: API_SET_ROUTE,
  payload: {
    kwargs,
  },
});

function* sagaSetRouteEffect(action) {
  try {
    const state = store.getState();

    yield put(setRequestCalling(action.payload.kwargs.message));
    const {data} = yield call(ShipmentApi.getRoute, state.auth.token);
    yield put(setRoute(data));

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- setStopStatus Saga ------------------------
const API_SET_STOP_STATUS = 'API_SET_STOP_STATUS';
export const sagaSetStopStatus = (status, location, stopId, kwargs = {}) => ({
  type: API_SET_STOP_STATUS,
  payload: {
    status,
    location,
    stopId,
    kwargs,
  },
});

function* sagaSetStopStatusEffect(action) {
  try {
    const state = store.getState();
    yield put(
      setStopStatus(
        action.payload.status,
        action.payload.location,
        action.payload.stopId,
      ),
    );

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitLoadingFinished Saga ------------------------
const API_SUBMIT_LOADING_FINISHED = 'API_SUBMIT_LOADING_FINISHED';
export const sagaSubmitLoadingFinished = (data, routeId, kwargs = {}) => ({
  type: API_SUBMIT_LOADING_FINISHED,
  payload: {
    data,
    routeId,
    kwargs,
  },
});

function* sagaSubmitLoadingFinishedEffect(action) {
  try {
    const state = store.getState();

    yield put(setRequestCalling(action.payload.kwargs.message));
    const {data} = yield call(
      ShipmentApi.submitLoadingFinished,
      action.payload.data,
      action.payload.routeId,
      state.auth.token,
    );
    yield put(setRoute(data));

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitCollectionSuccess Saga ------------------------
const API_SUBMIT_COLLECTION_SUCCESS = 'API_SUBMIT_COLLECTION_SUCCESS';
export const sagaSubmitCollectionSuccess = (data, stopId, kwargs = {}) => ({
  type: API_SUBMIT_COLLECTION_SUCCESS,
  payload: {
    data,
    stopId,
    kwargs,
  },
});

function* sagaSubmitCollectionSuccessEffect(action) {
  try {
    yield put(
      submitCollectionSuccess(action.payload.data, action.payload.stopId),
    );

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitCollectionFailure Saga ------------------------
const API_SUBMIT_COLLECTION_FAILURE = 'API_SUBMIT_COLLECTION_FAILURE';
export const sagaSubmitCollectionFailure = (data, stopId, kwargs = {}) => ({
  type: API_SUBMIT_COLLECTION_FAILURE,
  payload: {
    data,
    stopId,
    kwargs,
  },
});

function* sagaSubmitCollectionFailureEffect(action) {
  try {
    yield put(
      submitCollectionFailure(action.payload.data, action.payload.stopId),
    );

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitReturnSuccess Saga ------------------------
const API_SUBMIT_RETURN_SUCCESS = 'API_SUBMIT_RETURN_SUCCESS';
export const sagaSubmitReturnSuccess = (data, stopId, kwargs = {}) => ({
  type: API_SUBMIT_RETURN_SUCCESS,
  payload: {
    data,
    stopId,
    kwargs,
  },
});

function* sagaSubmitReturnSuccessEffect(action) {
  try {
    yield put(submitReturnSuccess(action.payload.data, action.payload.stopId));

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());
    console.log(err);

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitReturnFailure Saga ------------------------
const API_SUBMIT_RETURN_FAILURE = 'API_SUBMIT_RETURN_FAILURE';
export const sagaSubmitReturnFailure = (data, stopId, kwargs = {}) => ({
  type: API_SUBMIT_RETURN_FAILURE,
  payload: {
    data,
    stopId,
    kwargs,
  },
});

function* sagaSubmitReturnFailureEffect(action) {
  try {
    yield put(submitReturnFailure(action.payload.data, action.payload.stopId));

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    console.log(err);
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitDeliverySuccess Saga ------------------------
const API_SUBMIT_DELIVERY_SUCCESS = 'API_SUBMIT_DELIVERY_SUCCESS';
export const sagaSubmitDeliverySuccess = (data, orderId, kwargs = {}) => ({
  type: API_SUBMIT_DELIVERY_SUCCESS,
  payload: {
    data,
    orderId,
    kwargs,
  },
});

function* sagaSubmitDeliverySuccessEffect(action) {
  try {
    // yield put(setRequestCalling(action.payload.kwargs.message));
    // const {data} = yield call(ShipmentApi.submitDeliverySuccess, action.payload.data, action.payload.orderId, state.auth.token);
    // yield put(setRoute(data));
    yield put(
      submitDeliverySuccess(action.payload.data, action.payload.orderId),
    );

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitDeliveryFailure Saga ------------------------
const API_SUBMIT_DELIVERY_FAILURE = 'API_SUBMIT_DELIVERY_FAILURE';
export const sagaSubmitDeliveryFailure = (data, orderId, kwargs = {}) => ({
  type: API_SUBMIT_DELIVERY_FAILURE,
  payload: {
    data,
    orderId,
    kwargs,
  },
});

function* sagaSubmitDeliveryFailureEffect(action) {
  try {
    // yield put(setRequestCalling(action.payload.kwargs.message));
    // const {data} = yield call(ShipmentApi.submitDeliveryFailure, action.payload.data, action.payload.stopId, state.auth.token);
    // yield put(setRoute(data));
    yield put(
      submitDeliveryFailure(action.payload.data, action.payload.orderId),
    );

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- report wrong address saga ------------------------
const API_REPORT_WRONG_ADDRESS = 'API_REPORT_WRONG_ADDRESS';
export const sagaReportWrongAddress = (data, stopId, kwargs = {}) => ({
  type: API_REPORT_WRONG_ADDRESS,
  payload: {
    data,
    stopId,
    kwargs,
  },
});

function* sagaReportWrongAddressEffect(action) {
  try {
    yield put(
      reportWrongAddress(action.payload.data, action.payload.stopId),
    );
    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- submitShopHours Saga ------------------------
const API_SUBMIT_SHOP_HOURS = 'API_SUBMIT_SHOP_HOURS';
export const sagaSubmitShopHours = (data, orderId, kwargs = {}) => ({
  type: API_SUBMIT_SHOP_HOURS,
  payload: {
    data,
    orderId,
    kwargs,
  },
});

function* sagaSubmitShopHoursEffect(action) {
  try {
    yield put(setRequestCalling(action.payload.kwargs.message));
    const {data} = yield call(
      ShipmentApi.finishWork,
      action.payload.data,
      action.payload.stopId,
      state.auth.token,
    );
    yield put(setRoute(data));

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------- finishWork Saga ------------------------
const API_FINISH_WORK = 'API_FINISH_WORK';
export const sagaFinishWork = (data, routeId, kwargs = {}) => ({
  type: API_FINISH_WORK,
  payload: {
    data,
    routeId,
    kwargs,
  },
});

function* sagaFinishWorkEffect(action) {
  try {
    const state = store.getState();
    yield put(setRequestCalling(action.payload.kwargs.message));
    const {data} = yield call(
      ShipmentApi.finishWork,
      action.payload.data,
      action.payload.routeId,
      state.auth.token,
    );
    yield put(setRoute(data));

    const {onSuccess} = action.payload.kwargs;
    if (onSuccess) onSuccess();
  } catch (err) {
    yield put(setRequestFailure());

    const {onFailure} = action.payload.kwargs;
    if (onFailure) onFailure(err);
  }
}

// ---------------------------------------------------------------
export default function* routeSaga() {
  yield all([
    takeLatest(API_INIT_ROUTE, sagaInitRouteEffect),
    takeLatest(API_SET_CURRENT_STOP, sagaSetCurrentStopEffect),
    takeLatest(API_SET_STOP_STATUS, sagaSetStopStatusEffect),
    takeLatest(API_SET_ROUTE, sagaSetRouteEffect),
    takeLatest(API_SUBMIT_LOADING_FINISHED, sagaSubmitLoadingFinishedEffect),
    takeLatest(
      API_SUBMIT_COLLECTION_SUCCESS,
      sagaSubmitCollectionSuccessEffect,
    ),
    takeLatest(
      API_SUBMIT_COLLECTION_FAILURE,
      sagaSubmitCollectionFailureEffect,
    ),
    takeLatest(API_SUBMIT_DELIVERY_SUCCESS, sagaSubmitDeliverySuccessEffect),
    takeLatest(API_SUBMIT_DELIVERY_FAILURE, sagaSubmitDeliveryFailureEffect),
    takeLatest(API_SUBMIT_RETURN_SUCCESS, sagaSubmitReturnSuccessEffect),
    takeLatest(API_SUBMIT_RETURN_FAILURE, sagaSubmitReturnFailureEffect),
    takeLatest(API_REPORT_WRONG_ADDRESS, sagaReportWrongAddressEffect),
    takeLatest(API_SUBMIT_SHOP_HOURS, sagaSubmitShopHoursEffect),
    takeLatest(API_FINISH_WORK, sagaFinishWorkEffect),
  ]);
}
