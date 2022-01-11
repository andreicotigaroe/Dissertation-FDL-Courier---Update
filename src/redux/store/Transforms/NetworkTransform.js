import {createTransform} from 'redux-persist';
import {
  setCurrentStop,
  setStopStatus,
  submitCollectionSuccess,
  submitCollectionFailure,
  submitReturnSuccess,
  submitReturnFailure,
  submitDeliverySuccess,
  submitDeliveryFailure,
  reportWrongAddress,
} from '~/redux/actions/route';

// We have to map our actions to an object
const actions = {
  setCurrentStop,
  setStopStatus,
  submitCollectionSuccess,
  submitCollectionFailure,
  submitReturnSuccess,
  submitReturnFailure,
  submitDeliverySuccess,
  submitDeliveryFailure,
  reportWrongAddress
};

// Transform how the persistor reads the network state
const networkTransform = createTransform(
  (inboundState, key) => {
    const actionQueue = [];

    inboundState.actionQueue.forEach((action) => {
      if (typeof action === 'function') {
        actionQueue.push({
          function: action.meta.name,
          args: action.meta.args,
        });
      } else if (typeof action === 'object') {
        actionQueue.push(action);
      }
    });

    return {
      ...inboundState,
      actionQueue,
    };
  },
  (outboundState, key) => {
    const actionQueue = [];

    console.log('outboundState:', outboundState);

    outboundState.actionQueue.forEach((action) => {
      if (action.function) {
        const actionFunction = actions[action.function];
        actionQueue.push(actionFunction(...action.args));
      } else {
        actionQueue.push(action);
      }
    });

    return {...outboundState, actionQueue};
  },
  // The 'network' key may change depending on what you
  // named your network reducer.
  {whitelist: ['network']},
);

export default networkTransform;
