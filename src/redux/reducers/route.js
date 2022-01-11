import {Types} from '../actions/route';
import {consts} from '../../assets/values';

const initialState = {
  id: null,
  currentStopId: null,
  status: consts.ROUTE_STATUS.CREATED,
  stops: [],

  calling: false,
  callingMessage: null,
};

const setRoute = (prevState, route) => {
  if (!route) return initialState;
  else {
    return {
      ...prevState,
      id: route.id,
      currentStopId: route.current_stop_id,
      status: route.status,
      stops: [...route.stops],
      calling: false,
      callingMessage: null,
    };
  }
};

const setCurrentStop = (prevState, stopId) => {
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex((stop) => stop.id === stopId);
  if (stopIndex >= 0) {
    console.log('Stop Index: ', stopIndex);
    stops[stopIndex].status = consts.STOP_STATUS.IN_TRAVEL;
    return {
      ...prevState,
      currentStopId: stopId,
      stops,
    };
  } else {
    return {
      ...prevState,
    };
  }
};

const setStopStatus = (prevState, stopId, status) => {
  const stops = [...prevState.stops];
  const stop = stops.find((stop) => stop.id === stopId);
  if (stop) {
    stop.status = status;
    const currentStopId =
      status === consts.STOP_STATUS.DEFAULT ||
      status === consts.STOP_STATUS.FINISHED
        ? null
        : prevState.currentStopId;
    return {
      ...prevState,
      stops,
      currentStopId,
    };
  } else {
    return {
      ...prevState,
    };
  }
};

const setCollectionSuccess = (prevState, stopId, data) => {
  const stops = [...prevState.stops];
  const stop = stops.find((stop) => stop.id === stopId);
  const {orders, parcels} = data;
  if (stop) {
    orders.forEach((orderId) => {
      const o = stop.orders.find((_order) => _order.id === orderId);
      if (o) {
        o.status = consts.ORDER_STATUS.COLLECTED;
        o.parcels.forEach((parcel) => {
          const p = parcels.find((_parcel) => _parcel.id === parcel.id);
          if (p && p.scanned) {
            parcel.status = consts.PARCEL_STATUS.COLLECTED_BY_DRIVER;
            parcel.state = consts.PARCEL_STATE.NORMAL;
          }
        });
      }
    });

    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const setCollectionFailure = (prevState, stopId, data) => {
  const stops = [...prevState.stops];
  const stop = stops.find((stop) => stop.id === stopId);
  const {orders} = data;
  if (stop) {
    orders.forEach((orderId) => {
      const o = stop.orders.find((_order) => _order.id === orderId);
      if (o) {
        o.status = consts.ORDER_STATUS.NOT_COLLECTED;
        o.collection_failure = data.collection_failure;
      }
    });

    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const rollbackCollectionSuccess = (prevState, meta) => {
  const stops = [...prevState.stops];
  const stop = stops.find((stop) => stop.id === meta.stopId);
  const {orders} = meta.data;
  if (stop) {
    orders.forEach((orderId) => {
      const o = stop.orders.find((_order) => _order.id === orderId);
      if (o) {
        o.status = consts.ORDER_STATUS.OUT_FOR_COLLECTION;
        o.parcels.forEach((parcel) => {
          parcel.status = consts.PARCEL_STATUS.CREATED;
          parcel.state = consts.PARCEL_STATE.NOT_RECEIVED;
        });
      }
    });

    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const setReturnSuccess = (prevState, stopId, data) => {
  const stops = [...prevState.stops];
  const stop = stops.find((stop) => stop.id === stopId);
  const {orders, parcels} = data;
  if (stop) {
    orders.forEach((orderId) => {
      const o = stop.orders.find((_order) => _order.id === orderId);
      if (o) {
        o.status = consts.ORDER_STATUS.DELIVERED;
        o.parcels.forEach((parcel) => {
          const p = parcels.find((_parcel) => _parcel.id === parcel.id);
          if (p && p.scanned) {
            parcel.status = consts.PARCEL_STATUS.DELIVERED;
            parcel.state = consts.PARCEL_STATE.NORMAL;
          }
        });
      }
    });

    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const setReturnFailure = (prevState, stopId, data) => {
  const stops = [...prevState.stops];
  const stop = stops.find((stop) => stop.id === stopId);
  const {orders} = data;
  if (stop) {
    orders.forEach((orderId) => {
      const o = stop.orders.find((_order) => _order.id === orderId);
      if (o) {
        o.status = consts.ORDER_STATUS.NOT_DELIVERED;
        o.failure = data.failure;
      }
    });

    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const rollbackReturnSuccess = (prevState, meta) => {
  const prevOrders = meta.orders;
  const stops = [...prevState.stops];
  const stop = stops.find((stop) => stop.id === meta.stopId);
  if (stop) {
    stop.orders.forEach((order, index) => {
      prevOrders.forEach((prevOrder) => {
        if (prevOrder.id === order.id) stop.orders[index] = prevOrder;
      });
    });
    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const setDeliverySuccess = (prevState, orderId, data) => {
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex(
    (stop) => stop.orders.findIndex((order) => order.id === orderId) >= 0,
  );
  if (stopIndex >= 0) {
    const stop = stops[stopIndex];
    const order = stop.orders.find((order) => order.id === orderId);
    if (!order) return {...prevState};

    const parcels = data.parcels;

    order.parcels.forEach((parcel) => {
      const p = parcels.find((_parcel) => _parcel.id === parcel.id);
      if (p && p.scanned) {
        parcel.status = consts.PARCEL_STATUS.DELIVERED;
        parcel.state = p.state;
      }
    });
    order.recipient_name = data.recipient_name;
    order.recipient_signature = data.recipient_signature;
    order.recipient_house_number = data.recipient_house_number;
    order.leave_place = data.leave_place;
    order.delivered_at = new Date();
    order.status =
      order.parcels.filter(
        (parcel) => parcel.state === consts.PARCEL_STATE.NORMAL,
      ).length === order.parcels.length
        ? consts.ORDER_STATUS.DELIVERED
        : consts.ORDER_STATUS.PARTIALLY_DELIVERED;
    order.failure = consts.DELIVERY_FAILURE_TYPES.NONE;

    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const rollbackDeliverySuccess = (prevState, meta) => {
  const prevOrder = meta.order;
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex(
    (stop) => stop.orders.findIndex((order) => order.id === prevOrder.id) >= 0,
  );
  if (stopIndex >= 0) {
    const stop = stops[stopIndex];
    const orderIndex = stop.orders.findIndex(
      (order) => order.id === prevOrder.id,
    );
    if (!(orderIndex >= 0)) return {...prevState};

    stops[stopIndex].orders[orderIndex] = prevOrder;
    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const setDeliveryFailure = (prevState, orderId, data) => {
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex(
    (stop) => stop.orders.findIndex((order) => order.id === orderId) >= 0,
  );
  if (stopIndex >= 0) {
    const stop = stops[stopIndex];
    const order = stop.orders.find((order) => order.id === orderId);
    if (!order) return {...prevState};

    order.failure = data.reason;
    order.status = consts.ORDER_STATUS.NOT_DELIVERED;
    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const reportWrongAddress = (prevState, stopId, data) => {
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex((stop) => stop.id === stopId);
  if (stopIndex >= 0) {
    const stop = stops[stopIndex];
    if (
      data.choice === 'cannot_deliver' ||
      data.choice === 'out_of_delivery_area'
    ) {
      stop.orders.forEach((order) => {
        if (data.choice === 'cannot_deliver')
          order.failure = consts.DELIVERY_FAILURE_TYPES.WRONG_ADDRESS;
        else if (data.choice === 'out_of_delivery_area')
          order.failure = consts.DELIVERY_FAILURE_TYPES.OUT_OF_DELIVERY_AREA;
        order.status = consts.ORDER_STATUS.NOT_DELIVERED;
      });
      stop.status = consts.STOP_STATUS.FINISHED;
    } else {
      stop.status = consts.STOP_STATUS.DEFAULT;
    }
    return {
      ...prevState,
      stops,
      currentStopId: null
    };
  } else {
    return {...prevState};
  }
};

const rollbackWrongAddress = (prevState, meta) => {
  const prevStop = meta.stop;
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex((stop) => stop.id === prevStop.id);
  if (stopIndex >= 0) {
    stops[stopIndex] = prevStop;
    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const rollbackDeliveryFailure = (prevState, meta) => {
  const prevOrder = meta.order;
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex(
    (stop) => stop.orders.findIndex((order) => order.id === prevOrder.id) >= 0,
  );
  if (stopIndex >= 0) {
    const stop = stops[stopIndex];
    const orderIndex = stop.orders.findIndex(
      (order) => order.id === prevOrder.id,
    );
    if (!(orderIndex >= 0)) return {...prevState};

    stops[stopIndex].orders[orderIndex] = prevOrder;
    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

const setSetShopHours = (prevState, orderId, data) => {
  const stops = [...prevState.stops];
  const stopIndex = stops.findIndex(
    (stop) => stop.order && stop.order.id === orderId,
  );
  if (stopIndex >= 0) {
    const stop = stops[stopIndex];
    if (!stop.order) return {...prevState};

    if (!stop.order.shop) {
      stop.order.shop = {
        name: stop.order.customer_name,
        place_id: null,
        longitude: stop.order.drop_location.longitude,
        latitude: stop.order.drop_location.latitude,
        address: stop.order.drop_location.address,
      };
    }
    stop.order.shop['hours'] = data['hours'];

    return {
      ...prevState,
      stops,
    };
  } else {
    return {...prevState};
  }
};

export default routeReducer = (state = initialState, action) => {
  switch (action.type) {
    case Types.INIT:
      return initialState;
    case Types.REQUEST_CALLING:
      return {
        ...state,
        calling: true,
        callingMessage: action.data.message ? action.data.message : null,
      };
    case Types.REQUEST_FAILURE:
      return initialState;
    case Types.SET_ROUTE: {
      if (!action.data.route) return initialState;
      else
        return {
          ...state,
          id: action.data.route.id,
          currentStopId: action.data.route.current_stop_id,
          status: action.data.route.status,
          stops: action.data.route.stops,
          calling: false,
          callingMessage: null,
        };
    }
    case Types.SET_CURRENT_STOP:
      return setCurrentStop(state, action.payload.stopId);
    case Types.SET_STOP_STATUS:
      return setStopStatus(state, action.payload.stopId, action.payload.status);
    case `${Types.SUBMIT_COLLECTION_SUCCESS}`:
      return setCollectionSuccess(
        state,
        action.payload.stopId,
        action.payload.data,
      );
    case `${Types.SUBMIT_COLLECTION_FAILURE}`:
      return setCollectionFailure(
        state,
        action.payload.stopId,
        action.payload.data,
      );
    case `${Types.SUBMIT_DELIVERY_SUCCESS}`:
      return setDeliverySuccess(
        state,
        action.payload.orderId,
        action.payload.data,
      );
    case `${Types.SUBMIT_DELIVERY_FAILURE}`:
      return setDeliveryFailure(
        state,
        action.payload.orderId,
        action.payload.data,
      );
    case `${Types.SUBMIT_RETURN_SUCCESS}`:
      return setReturnSuccess(
        state,
        action.payload.stopId,
        action.payload.data,
      );
    case `${Types.SUBMIT_RETURN_FAILURE}`:
      return setReturnFailure(
        state,
        action.payload.stopId,
        action.payload.data,
      );
    case `${Types.SET_SHOP_HOURS}`:
      return setSetShopHours(
        state,
        action.payload.orderId,
        action.payload.data,
      );
    case `${Types.REPORT_WRONG_ADDRESS}`:
      return reportWrongAddress(
        state,
        action.payload.stopId,
        action.payload.data,
      );
    case `${Types.SET_CURRENT_STOP}_COMMIT`:
    case `${Types.SET_STOP_STATUS}_COMMIT`:
    case `${Types.SUBMIT_COLLECTION_SUCCESS}_COMMIT`:
    case `${Types.SUBMIT_COLLECTION_FAILURE}_COMMIT`:
    case `${Types.SUBMIT_DELIVERY_SUCCESS}_COMMIT`:
    case `${Types.SUBMIT_DELIVERY_FAILURE}_COMMIT`:
    case `${Types.SUBMIT_RETURN_SUCCESS}_COMMIT`:
    case `${Types.SUBMIT_RETURN_FAILURE}_COMMIT`:
    case `${Types.REPORT_WRONG_ADDRESS}_COMMIT`:
    case `${Types.SET_SHOP_HOURS}_COMMIT`:
      return setRoute(state, {...action.payload.data});
    case `${Types.SET_CURRENT_STOP}_ROLLBACK`:
    case `${Types.SET_STOP_STATUS}_ROLLBACK`:
    case `${Types.SUBMIT_DELIVERY_FAILURE}_ROLLBACK`:
      return rollbackDeliveryFailure(state, action.meta);
    case `${Types.REPORT_WRONG_ADDRESS}_ROLLBACK`:
      return rollbackWrongAddress(state, action.meta);
    case `${Types.SET_SHOP_HOURS}_ROLLBACK`:
      return {...action.meta.route};
    case `${Types.SUBMIT_DELIVERY_SUCCESS}_ROLLBACK`:
      return rollbackDeliverySuccess(state, action.meta);
    case `${Types.SUBMIT_COLLECTION_SUCCESS}_ROLLBACK`:
    case `${Types.SUBMIT_COLLECTION_FAILURE}_ROLLBACK`:
      return rollbackCollectionSuccess(state, action.meta);
    case `${Types.SUBMIT_RETURN_SUCCESS}_ROLLBACK`:
    case `${Types.SUBMIT_RETURN_FAILURE}_ROLLBACK`:
      return rollbackReturnSuccess(state, action.meta);
    default:
      return state;
  }
};
