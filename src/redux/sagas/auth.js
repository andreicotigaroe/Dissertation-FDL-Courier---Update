import { fork, all, takeLatest, call, put } from "redux-saga/effects";
import { Types as AuthTypes, logout } from "../actions/auth";
import AuthApi from "../../services/api/AuthApi";
import {setUserData, setRequestCalling, setRequestFailure, setAuthToken} from "../actions/auth";

// ---------------------- Login Saga ------------------------
const API_LOGIN = "API_LOGIN";
export const sagaLogin = (email, password, kwargs={}) => ({
    type: API_LOGIN,
    payload: {
        email, 
        password,
        kwargs
    }
})

function * sagaLoginEffect(action) {
    try {
        yield put(setRequestCalling(action.payload.kwargs.message));
        const { data } = yield call(AuthApi.login, action.payload);
        console.log('User Data:', data);
        yield put(setUserData(data.user));
        yield put(setAuthToken(data.token));

        const {onSuccess} = action.payload.kwargs;
        if (onSuccess) 
            onSuccess();
    } catch (err) {
        yield put(setRequestFailure());

        const {onFailure} = action.payload.kwargs;
        if (onFailure) 
            onFailure(err);
    }
}


// ---------------------- GetAuthUser Saga ------------------------
const API_GET_AUTH_USER = "API_GET_AUTH_USER";
export const sagaGetAuthUser = (token, kwargs={}) => ({
    type: API_GET_AUTH_USER,
    payload: {
        token,
        kwargs
    }
})

function * sagaGetAuthUserEffect(action) {
    try {
        yield put(setRequestCalling(action.payload.kwargs.message));
        const { data } = yield call(AuthApi.getAuthUser, action.payload.token);
        yield put(setUserData(data));
        yield put(setAuthToken(action.payload.token));

        const {onSuccess} = action.payload.kwargs;
        if (onSuccess) 
            onSuccess();
    } catch (err) {
        console.log('GetAuthUser Error:', err.response);
        yield put(setRequestFailure());

        const {onFailure} = action.payload.kwargs;
        if (onFailure) 
            onFailure(err);
    }
}


// ---------------------- Logout Saga ------------------------
const API_LOGOUT = "API_LOGOUT";
export const sagaLogout = (kwargs={}) => ({
    type: API_LOGOUT,
    payload: {
        kwargs
    }
})

function * sagaLogoutEffect(action) {
    try {
        yield put(logout(action.payload.token));

        const {onSuccess} = action.payload.kwargs;
        if (onSuccess) 
            onSuccess();
    } catch (err) {
    }
}


// ---------------------------------------------------------------
export default function* authSaga() {
    yield all([
        takeLatest(API_LOGIN, sagaLoginEffect),
        takeLatest(API_GET_AUTH_USER, sagaGetAuthUserEffect),
        takeLatest(API_LOGOUT, sagaLogoutEffect),
    ])
}