import admin from '../config/firebase';

export async function sendFCM(deviceId: string, text: string) {
  if (process.env.MOCK_FCM === 'true') {
    console.log('[MOCK] FCM sent to', deviceId);
    return;
  }

  return admin.messaging().send({
    token: deviceId,
    notification: {
      title: 'Incoming message',
      body: text
    }
  });
}
