export const Types = {
    SET_USER_DATA: 'AUTH_SET_USER_DATA',
    SET_AUTH_TOKEN : 'AUTH_SET_AUTH_TOKEN',
    SET_FCM_TOKEN : 'AUTH_SET_FCM_TOKEN',

    REQUEST_CALLING: 'AUTH_REQUEST_CALLING',
    REQUEST_FAILURE: 'AUTH_REQUEST_ERROR',

    LOGOUT: 'AUTH_LOG_OUT',
};

export const setRequestCalling = (message) => ({
    type: Types.REQUEST_CALLING,
    data: {
        message,
    }
});

export const setRequestFailure = () => ({
    type: Types.REQUEST_FAILURE,
});

export const setUserData = user => ({
    type: Types.SET_USER_DATA,
    data: user,
});

export const setAuthToken = token => ({
    type: Types.SET_AUTH_TOKEN,
    data: token,
});

export const setFcmToken = token => ({
  type: Types.SET_FCM_TOKEN,
  data: token,
});

export const logout = () => ({
  type: Types.LOGOUT,
});

