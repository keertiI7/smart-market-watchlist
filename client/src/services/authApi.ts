import { api } from './api';
import { User } from '../types';

export async function register(name: string, email: string, password: string) {
  const res = await api.post<{ success: true; data: { user: User; token: string } }>('/auth/register', {
    name,
    email,
    password,
  });
  return res.data.data;
}

export async function login(email: string, password: string) {
  const res = await api.post<{ success: true; data: { user: User; token: string } }>('/auth/login', {
    email,
    password,
  });
  return res.data.data;
}

export async function fetchMe() {
  const res = await api.get<{ success: true; data: { user: User } }>('/auth/me');
  return res.data.data.user;
}
