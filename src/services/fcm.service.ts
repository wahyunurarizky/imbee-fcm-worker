import { getFirebase } from '../config/firebase';

export async function sendFCM(deviceId: string, text: string) {
  if (process.env.MOCK_FCM === 'true') {
    console.log('[MOCK_FCM] FCM sent to', deviceId);
    return;
  }

  const firebase = getFirebase();

  return firebase.messaging().send({
    token: deviceId,
    notification: {
      title: 'Incoming message',
      body: text
    }
  });
}
