import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { connectRabbitMQ } from './config/rabbitmq';
import { startConsumer } from './consumers/fcm.consumer';

async function initDB(retries = 10, delay = 3000): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('MySQL connected');
  } catch (err) {
    if (retries === 0) throw err;
    console.log(`MySQL not ready, retrying... (${retries})`);
    await new Promise((res) => setTimeout(res, delay));
    return initDB(retries - 1, delay);
  }
}

async function bootstrap() {
  await initDB();
  const channel = await connectRabbitMQ();
  await startConsumer(channel);
  console.log('FCM Worker started');
}

bootstrap();
