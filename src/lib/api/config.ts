export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.toString() ?? '';

export const endpoints = {
  signin: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
};
