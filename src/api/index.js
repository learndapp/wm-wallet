import axios from 'axios';
import qs from 'qs';

axios.qs = qs;

axios.defaults.baseURL = process.env.NODE_ENV === 'production'
  ? 'https://api.w3c.market/api'
  : 'http://localhost:7030/api';

axios.interceptors.request.use(
  (_config) => {
    const config = _config;
    if (config.method === 'post') {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return config;
  },
  error => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => {
    const { data } = response;
    return data;
  },
  (error) => {
    const e = new Error(error);
    const code = parseInt(String(e).split('code ')[1], 10);
    let err = '请稍后重试';
    if (code === 401) {
      err = '登录凭证已过期';
    }
    if (code === 403) {
      err = '访问被禁止';
    }
    return {
      err,
    };
  },
);

export default axios;
