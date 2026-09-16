import axios from 'axios';
import type {
  AuthResponse,
  DashboardStats,
  LoginPayload,
  SignupPayload,
  VerificationRecord,
} from '@/types';
import {
  getMockDashboardStats,
  mockLogin,
  mockSignup,
  mockVerify,
} from './mockData';

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({ baseURL: BASE_URL, timeout: 8000 });

function isNetworkError(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    return (
      err.code === 'ERR_NETWORK' ||
      err.code === 'ECONNABORTED' ||
      err.code === 'ERR_CONNECTION_REFUSED' ||
      !err.response
    );
  }
  return true;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/login', payload);
    return data;
  } catch (err) {
    if (isNetworkError(err)) return mockLogin(payload);
    throw err;
  }
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/signup', payload);
    return data;
  } catch (err) {
    if (isNetworkError(err)) return mockSignup(payload);
    throw err;
  }
}

export async function fetchDashboardStats(
  userId: string,
  role: string
): Promise<DashboardStats> {
  try {
    const { data } = await api.get<DashboardStats>(
      `/dashboard-stats?user_id=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`
    );
    return data;
  } catch (err) {
    if (isNetworkError(err)) return getMockDashboardStats(userId, role);
    throw err;
  }
}

export async function verifyDocument(
  file: File,
  userId: string
): Promise<VerificationRecord> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<VerificationRecord>(
      `/verify?user_id=${encodeURIComponent(userId)}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 }
    );
    return data;
  } catch (err) {
    if (isNetworkError(err)) return mockVerify(file.name, userId);
    throw err;
  }
}
