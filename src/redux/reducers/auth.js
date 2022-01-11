import {Types} from '../actions/auth';

const initialState = {
  user: null,
  token: null,
  calling: false,
  callingMessage: null,
  fcmToken: null,
};

export default authReducer = (state = initialState, action) => {
  switch (action.type) {
    case Types.REQUEST_CALLING:
      return {
        ...state,
        calling: true,
        callingMessage: action.data.message ? action.data.message : null,
      };
    case Types.REQUEST_FAILURE:
      return {
        calling: false,
        callingMessage: null,
        user: null,
        token: null,
      };
    case Types.SET_USER_DATA:
      return {
        ...state,
        user: action.data,
        callingMessage: null,
        calling: false,
      };
    case Types.SET_AUTH_TOKEN:
      return {
        ...state,
        token: action.data,
      };
    case Types.SET_FCM_TOKEN:
      return {
        ...state,
        fcmToken: action.data,
      };
    case Types.LOGOUT:
      return initialState;
    default:
      return state;
  }
};
