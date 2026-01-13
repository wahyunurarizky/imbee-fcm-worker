import admin from 'firebase-admin';
import { env } from './env';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.firebase.projectId,
    clientEmail: env.firebase.clientEmail,
    privateKey: env.firebase.privateKey
  })
});

export default admin;
