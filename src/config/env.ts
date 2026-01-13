import 'dotenv/config';

export const env = {
  appPort: process.env.APP_PORT || '3000',

  mysql: {
    host: process.env.MYSQL_HOST!,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DB!
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL!,
    fcmQueue: process.env.RABBITMQ_FCM_QUEUE!,
    doneTopic: process.env.RABBITMQ_DONE_TOPIC!
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
  }
};
