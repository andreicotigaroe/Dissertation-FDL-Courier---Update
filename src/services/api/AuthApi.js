import axios from 'axios';
import Config from 'react-native-config';
import {consts} from '../../assets/values';

const login = (data) => {
  var formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);

  console.log(data);

  return axios.post(`${Config.API_URL}/api/driver/login/`, formData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const getAuthUser = (token) => {
  return axios.get(`${Config.API_URL}/api/driver/`, {
    headers: {Authorization: `Token ${token}`},
  });
};

const signup = (data) => {
  var formData = new FormData();
  formData.append('first_name', data.firstName);
  formData.append('last_name', data.lastName);
  formData.append('gender', data.gender);
  formData.append('email', data.email);
  formData.append('phone_number', data.phoneNumber);
  formData.append('role', consts.ROLE_ID_DRIVER);
  formData.append('password', data.password);
  formData.append('confirm_password', data.confirmPassword);

  return axios.post(`${Config.API_URL}/api/register/`, formData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const registerFCMToken = (fcmToken, token) => {
  return axios.post(
    `${Config.API_URL}/api/auth/register-fcm-token/`,
    {fcm_token: fcmToken},
    {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

const getAppInfo = () => {
  return axios.get(`${Config.API_URL}/api/app-info/`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const registerAppInfo = (version, token) => {
  return axios.post(
    `${Config.API_URL}/api/driver/app-info/`,
    {version},
    {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

const sendTestNotification = (token) => {
  return axios.post(
    `${Config.API_URL}/api/driver/send-test-notification/`,
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
};

export default AuthApi = {
  login,
  signup,
  getAuthUser,

  getAppInfo,
  registerAppInfo,

  registerFCMToken,
  sendTestNotification,
};
