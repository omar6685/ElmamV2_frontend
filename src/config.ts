import { AuthStrategy } from '@/lib/auth/strategy';
import { getSiteURL } from '@/lib/get-site-url';
import { LogLevel } from '@/lib/logger';
import type { PrimaryColor } from '@/styles/theme/types';

export interface Config {
  site: {
    name: string;
    description: string;
    language: string;
    themeColor: string;
    primaryColor: PrimaryColor;
    url: string;
    version: string;
  };
  logLevel: keyof typeof LogLevel;
  auth: { strategy: keyof typeof AuthStrategy };
  firebase: {
    apiKey?: string;
    appId?: string;
    authDomain?: string;
    messagingSenderId?: string;
    projectId?: string;
    storageBucket?: string;
  };
  mapbox: { apiKey?: string };
  gtm?: { id?: string };
}

export const config = {
  site: {
    name: 'Elmam',
    description: 'Elmam is a platform that helps you to manage your business.',
    language: 'en',
    themeColor: '#090a0b',
    primaryColor: 'neonBlue',
    url: getSiteURL(),
    version: process.env.NEXT_PUBLIC_SITE_VERSION || '0.0.0',
  },
  logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) || LogLevel.ALL,
  auth: { strategy: (process.env.NEXT_PUBLIC_AUTH_STRATEGY as keyof typeof AuthStrategy) || AuthStrategy.CUSTOM },

  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  },
  mapbox: { apiKey: process.env.NEXT_PUBLIC_MAPBOX_API_KEY },
  gtm: { id: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID },
} satisfies Config;
