import { Channel } from 'amqplib';
import { env } from '../config/env';

export function publishDone(channel: Channel, payload: { identifier: string; deliverAt: string }) {
  channel.publish(env.rabbitmq.doneTopic, '', Buffer.from(JSON.stringify(payload)), { persistent: true });
}
