import axios, { AxiosError } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smw_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorShape {
  code: string;
  message: string;
}

/** Pulls the backend's { success:false, error:{code,message} } shape into a plain message. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ error?: ApiErrorShape }>;
    return axiosErr.response?.data?.error?.message || axiosErr.message || 'Something went wrong.';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}
