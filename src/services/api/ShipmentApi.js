import axios from 'axios';
import Config from "react-native-config";
import AppConfig from '../../config';
import { consts } from '../../assets/values';

const getRoute = (token) => {
  return axios.get(`${Config.API_URL}/api/driver/route/`,
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const setCurrentStop = (stopId, location, time, routeId, token) => {
  return axios.post(`${Config.API_URL}/api/driver/set-stop/${routeId}/`, { stop: stopId, location, time },
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const setStopStatus = (status, stopId, token) => {
  return axios.post(`${Config.API_URL}/api/driver/stops/${stopId}/status/`, { status: status },
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

// const submitLoadingFinished = (data, stopId, token) => {
//   return axios.post(`${Config.API_URL}/api/driver/stops/${stopId}/status/`, { status: consts.STOP_STATUS.FINISHED, parcels: data.parcels },
//     {
//       headers: {
//         'Authorization': `Token ${token}`,
//         'Content-Type': 'application/json',
//       }
//     });
// }

const submitLoadingFinished = (data, routeId, token) => {
  const payload = {
    mileage: data.mileage,
    odometer_picture: data.odometer_picture,
    parcels: data.parcels,
    started_location: data.started_location,
  };
  return axios.post(`${Config.API_URL}/api/routes/${routeId}/start/`, payload,
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const submitDeliverySuccess = (data, orderId, token) => {
  const payload = {
    succeeded: true,
    recipient_name: data.recipient_name,
    signature: data.signature,
    parcels: data.parcels
  };
  return axios.post(`${Config.API_URL}/api/orders/${orderId}/finish-delivery/`, payload,
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const submitDeliveryFailure = (reason, stopId, token) => {
  const payload = {
    status: consts.STOP_STATUS.FINISHED,
    succeeded: false,
    reason: reason,
  };
  return axios.post(`${Config.API_URL}/api/driver/stops/${stopId}/status/`, payload,
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const submitShopHours = (data, routeId, orderId, token) => {
  return axios.post(`${Config.API_URL}/api/shops/${orderId}/hours/`, { hours: data, route_id: routeId },
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const finishWork = (data, routeId, token) => {
  const payload = {
    mileage: data.mileage,
    odometer_picture: data.odometer_picture,
    finished_location: data.finished_location,
    finished_place: data.finished_place,
    other_place_finish_description: data.other_place_finish_description
  };
  return axios.post(`${Config.API_URL}/api/routes/${routeId}/finish/`, payload,
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const getPickableOrders = (d, token) => {
  return axios.get(`${Config.API_URL}/api/driver/orders/pickable-list/?date=${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const addOrderToRoute = (parcels, currentLocation, reroute, routeId, token) => {
  return axios.post(`${Config.API_URL}/api/routes/${routeId}/add-orders/`, {
    parcels,
    location: currentLocation,
    reroute,
  },
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const setDriverLocation = (location, routeId, token) => {
  return axios.patch(`${Config.API_URL}/api/routes/${routeId}/`, {driver_location: location},
    {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    });
}

const reportWrongAddress = (address, choice, location, stopId, token) => {
  return axios.post(`${Config.API_URL}/api/stops/${stopId}/report-wrong-address/`, {
    address,
    choice,
    location
  }, {
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    }
  });
}

export default ShipmentApi = {
  setCurrentStop,
  getRoute,

  setStopStatus,
  submitDeliverySuccess,
  submitDeliveryFailure,
  submitLoadingFinished,
  submitShopHours,
  finishWork,
  getPickableOrders,
  addOrderToRoute,

  reportWrongAddress,

  setDriverLocation
}