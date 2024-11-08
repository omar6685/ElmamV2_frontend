'use client';

import { FirebaseStorage, getStorage } from 'firebase/storage';

import { getFirebaseApp } from '@/lib/firebase/client';

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
