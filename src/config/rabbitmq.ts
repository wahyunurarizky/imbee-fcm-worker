import amqp, { Channel } from 'amqplib';
import { env } from './env';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

export async function connectRabbitMQ(): Promise<Channel> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const connection = await amqp.connect(env.rabbitmq.url);
      const channel = await connection.createChannel();

      console.log('RabbitMQ connected');

      await channel.assertQueue(env.rabbitmq.fcmQueue, { durable: true });
      await channel.assertExchange(env.rabbitmq.doneTopic, 'fanout', { durable: true });
      return channel;
    } catch (err) {
      attempt++;
      console.error(`RabbitMQ connection failed (attempt ${attempt}/${MAX_RETRIES})`);

      if (attempt >= MAX_RETRIES) {
        throw err;
      }

      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    }
  }

  throw new Error('Unreachable');
}
