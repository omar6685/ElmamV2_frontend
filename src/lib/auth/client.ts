'use client';

import { AxiosResponse } from 'axios';

import type { User } from '@/types/user';
import apiInstance from '@/lib/api/axios';
import { endpoints } from '@/lib/api/config';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

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
        return { error: 'Invalid credentials' };
      }
    } catch (error) {
      return { error: 'Invalid credentials' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
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
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('auth-token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('auth-token');

    return {};
  }
}

export const authClient = new AuthClient();
