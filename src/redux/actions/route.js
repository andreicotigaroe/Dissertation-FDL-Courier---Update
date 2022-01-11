import Config from 'react-native-config';
import axios from 'axios';
import {offlineActionCreators} from 'react-native-offline';

import {store} from '../../../App';

const {changeQueueSemaphore} = offlineActionCreators;

export const Types = {
  SET_CURRENT_STOP: 'ROUTE_SET_CURRENT_STOP',
  SET_STOP_STATUS: 'ROUTE_SET_STOP_STATUS',
  SET_ROUTE_STATUS: 'ROUTE_SET_ROUTE_STATUS',
  SUBMIT_COLLECTION_SUCCESS: 'ROUTE_SUBMIT_COLLECTION_SUCCESS',
  SUBMIT_COLLECTION_FAILURE: 'ROUTE_SUBMIT_COLLECTION_FAILURE',
  SUBMIT_DELIVERY_SUCCESS: 'ROUTE_SUBMIT_DELIVERY_SUCCESS',
  SUBMIT_DELIVERY_FAILURE: 'ROUTE_SUBMIT_DELIVERY_FAILURE',
  SUBMIT_RETURN_SUCCESS: 'ROUTE_SUBMIT_RETURN_SUCCESS',
  SUBMIT_RETURN_FAILURE: 'ROUTE_SUBMIT_RETURN_FAILURE',
  REPORT_WRONG_ADDRESS: 'ROUTE_REPORT_WRONG_ADDRESS',
  SET_SHOP_HOURS: 'ROUTE_SET_SHOP_HOURS',
  SET_ROUTE: 'ROUTE_SET_ROUTE',

  REQUEST_CALLING: 'ROUTE_REQUEST_CALLING',
  REQUEST_FAILURE: 'ROUTE_REQUEST_ERROR',
};

export const setRoute = (route) => ({
  type: Types.SET_ROUTE,
  data: {
    route,
  },
});

export const setRequestCalling = (message) => ({
  type: Types.REQUEST_CALLING,
  data: {
    message,
  },
});

export const setRequestFailure = () => ({
  type: Types.REQUEST_FAILURE,
});

// --------------------------- Set Stop --------------------------- //

export const setCurrentStopOffline = (stopId) => ({
  type: Types.SET_CURRENT_STOP,
  payload: {stopId},
});

export const setCurrentStop = (stopId, location, time) => {
  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/driver/set-stop/${getState().route.id}/`,
        {stop: stopId, location, time},
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('setCurrentStop:', error);
    }
  }
  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'setCurrentStop',
    args: [stopId, location, time],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Setting Stop Status --------------------------- //

export const setStopStatusOffline = (status, stopId) => ({
  type: Types.SET_STOP_STATUS,
  payload: {status, stopId},
});

export const setStopStatus = (status, location, time, stopId) => {

  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/driver/stops/${stopId}/status/`,
        {status, location, time},
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('setStopStatus:', error);
    }
  }

  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'setStopStatus',
    args: [status, location, time, stopId],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Collection Success --------------------------- //

export const submitCollectionSuccessOffline = (data, stopId) => ({
  type: Types.SUBMIT_COLLECTION_SUCCESS,
  payload: {data, stopId},
});

export const submitCollectionSuccess = (data, time, stopId) => {
  const payload = {
    succeeded: true,
    collect_place: data.collect_place,
    sender_name: data.sender_name,
    signature: data.signature,
    collection_picture: data.collection_picture,
    orders: data.orders,
    parcels: data.parcels,
    collected_location: data.collected_location,
    route: data.routeId,
    time: time,
  };
  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/orders/finish-collection/`,
        payload,
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('submitCollectionSuccess:', error);
    }
  }
  
  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'submitCollectionSuccess',
    args: [data, time, stopId],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Collection Failure --------------------------- //

export const submitCollectionFailureOffline = (data, stopId) => ({
  type: Types.SUBMIT_COLLECTION_FAILURE,
  payload: {data, stopId},
});

export const submitCollectionFailure = (data, time, stopId) => {
  const payload = {
    succeeded: false,
    collection_failure: data.reason,
    collection_picture: data.collection_picture,
    orders: data.orders,
    route: data.routeId,
    time: time,
  };

  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/orders/finish-collection/`,
        payload,
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('submitCollectionFailure:', error);
    }
  }

  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'submitCollectionFailure',
    args: [data, time, stopId],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Return Success --------------------------- //

export const submitReturnSuccessOffline = (data, stopId) => ({
  type: Types.SUBMIT_RETURN_SUCCESS,
  payload: {data, stopId},
});

export const submitReturnSuccess = (data, time, stopId) => {
  const payload = {
    succeeded: true,
    leave_place: data.leave_place,
    recipient_name: data.recipient_name,
    signature: data.signature,
    leave_picture: data.leave_picture,
    orders: data.orders.map((order) => order.id),
    parcels: data.parcels,
    delivered_location: data.delivered_location,
    route: data.routeId,
    time: new Date(),
  };
  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/orders/finish-return/`,
        payload,
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('submitReturnSuccess:', error);
    }
  }
  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'submitReturnSuccess',
    args: [data, time, stopId],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Delivery Failure --------------------------- //

export const submitReturnFailureOffline = (data, stopId) => ({
  type: Types.SUBMIT_RETURN_FAILURE,
  payload: {data, stopId},
});

export const submitReturnFailure = (data, time, stopId) => {
  const payload = {
    succeeded: true,
    leave_place: data.leave_place,
    recipient_name: data.recipient_name,
    signature: data.signature,
    leave_picture: data.leave_picture,
    orders: data.orders.map((order) => order.id),
    parcels: data.parcels,
    delivered_location: data.delivered_location,
    route: data.routeId,
    time: new Date(),
  };
  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/orders/finish-return/`,
        payload,
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('submitReturnFailure:', error);
    }
  }
  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'submitReturnFailure',
    args: [data, time, stopId],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Delivery Success --------------------------- //

export const submitDeliverySuccessOffline = (data, orderId) => ({
  type: Types.SUBMIT_DELIVERY_SUCCESS,
  payload: {data, orderId},
});

export const submitDeliverySuccess = (data, time, orderId) => {
  console.log('[submitDeliverySuccess]', orderId);

  const payload = {
    succeeded: true,
    leave_place: data.leave_place,
    recipient_name: data.recipient_name,
    recipient_signature: data.recipient_signature,
    recipient_house_number: data.recipient_house_number,
    leave_picture: data.leave_picture,
    parcels: data.parcels,
    delivered_location: data.delivered_location,
    recipient_dob: data.recipient_dob,
    cash_received: data.cash_received,
    route: data.routeId,
    time,
  };

  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/orders/${orderId}/finish-delivery/`,
        payload,
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('submitDeliverySuccess:', error);
    }
  }
  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'submitDeliverySuccess',
    args: [data, time, orderId],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Delivery Failure --------------------------- //

export const submitDeliveryFailureOffline = (data, orderId) => ({
  type: Types.SUBMIT_DELIVERY_FAILURE,
  payload: {data, orderId},
});

export const submitDeliveryFailure = (data, time, orderId) => {
  const payload = {
    succeeded: false,
    reason: data.reason,
    leave_picture: data.leave_picture,
    parcels: data.parcels,
    route: data.routeId,
    time,
  };

  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/orders/${orderId}/finish-delivery/`,
        payload,
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('submitDeliveryFailure:', error);
    }
  }

  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'submitDeliveryFailure',
    args: [data, time, orderId],
  };
  return thunk; // Return it afterwards
};

// --------------------------- Wrong Address Report --------------------------- //

export const reportWrongAddressOffline = (data, stopId) => ({
  type: Types.REPORT_WRONG_ADDRESS,
  payload: {data, stopId},
});

export const reportWrongAddress = (data, time, stopId) => {
  const payload = {
    address: data.address,
    choice: data.choice,
    location: data.location,
    time,
  };

  async function thunk(dispatch, getState) {
    try {
      dispatch(changeQueueSemaphore('RED'));
      const response = await axios.post(
        `${Config.API_URL}/api/stops/${stopId}/report-wrong-address/`,
        payload,
        {
          headers: {
            Authorization: `Token ${getState().auth.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      dispatch(setRoute(response.data));
      dispatch(changeQueueSemaphore('GREEN'));
    } catch (error) {
      console.log('reportWrongAddress:', error);
    }
  }
  thunk.interceptInOffline = true; // This is the important part
  thunk.meta = {
    retry: true,
    name: 'reportWrongAddress',
    args: [data, time, stopId],
  };
  return thunk; // Return it afterwards
};
