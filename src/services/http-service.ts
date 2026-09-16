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

const get = <T = unknown>(url: string, params?: Record<string, unknown>) => {
  return httpService.get<T>(url, { params });
};

const post = <T = unknown>(url: string, data?: Record<string, unknown>) => {
  return httpService.post<T>(url, data);
};

export default {
  ...httpService,
  get,
  post,
};

export type { AxiosResponse };
