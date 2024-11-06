import axios from 'axios';

import { API_BASE_URL } from './config';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
  headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')?.toString()}` },
});

export default apiInstance;
