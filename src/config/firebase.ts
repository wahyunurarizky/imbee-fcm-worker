import admin from 'firebase-admin';
import { env } from './env';

let firebaseApp: admin.app.App | null = null;

export function getFirebase() {
  if (process.env.MOCK_FCM === 'true') {
    throw new Error('Firebase should not be initialized in MOCK_FCM mode');
  }

  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey.replace(/\\n/g, '\n')
      })
    });
  }

  return firebaseApp;
}
