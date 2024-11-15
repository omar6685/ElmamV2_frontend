'use client';

import { AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';

import type { User } from '@/types/user';
import apiInstance from '@/lib/api/axios';
import { endpoints } from '@/lib/api/config';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    // Remove the old token if it exists
    localStorage.removeItem('auth-token');

    const { firstName, lastName, email, phone, password } = params;

    // Make API request
    try {
      const response: AxiosResponse<{ access_token: string }> = await apiInstance
        .post(endpoints.signup, {
          firstName,
          lastName,
          email,
          phone,
          password,
          fcmToken: generateToken(),
        })
        .catch((error) => {
          throw Error();
        });

      if (response.status === 201) {
        const data = response.data;
        localStorage.setItem('auth-token', data.access_token);

        return {};
      } else {
        console.log(response);
        return { error: 'Invalid credentials' };
      }
    } catch (error) {
      console.log(error);
      return { error: 'Invalid credentials' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    // Remove the old token if it exists
    localStorage.removeItem('auth-token');

    const { email, password } = params;

    // Make API request
    try {
      const response: AxiosResponse<{ access_token: string }> = await apiInstance
        .post(endpoints.signin, {
          email,
          password,
          fcmToken: '',
        })
        .catch((error) => {
          throw Error();
        });

      console.log('Response:', response);

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem('auth-token', data.access_token);

        return {};
      } else {
        return { error: 'Invalid credentials' };
      }
    } catch (error) {
      console.log('catch error', error);
      return { error: 'Invalid credentials' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('auth-token');

    if (!token) {
      return { data: null };
    }

    const decodedToken = jwtDecode(token) as User;
    return { data: decodedToken };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('auth-token');

    return {};
  }
}

export const authClient = new AuthClient();
