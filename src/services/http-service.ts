import axios, { AxiosResponse } from 'axios';
import { HOST_API_KEY } from '../../config-global';


export interface IApiResponse<T> {
    data: T;
}


const httpService = axios.create({
  baseURL: HOST_API_KEY,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpService.interceptors.request.use(
  (config) => {
    // اضافه کردن توکن یا هدرهای موردنیاز
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpService.interceptors.response.use(
  <T>(res: AxiosResponse<IApiResponse<T>>) => {
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const get = (url: string, params?: Record<string, unknown>) => {
  return httpService.get(url, { params });
};

const post = (url: string, data: Record<string, unknown>) => {
  return httpService.post(url, data);
};

export default {
  ...httpService,
  get,
  post,
};
