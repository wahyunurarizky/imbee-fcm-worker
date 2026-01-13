import { Channel, ConsumeMessage } from 'amqplib';
import { sendFCM } from '../services/fcm.service';
import { publishDone } from '../publishers/notification-done.publisher';
import { AppDataSource } from '../config/data-source';
import { FcmJob } from '../entities/fcm-job.entity';
import { env } from '../config/env';

type FcmMessage = {
  identifier: string;
  type: string;
  deviceId: string;
  text: string;
};

function isValid(data: any): data is FcmMessage {
  return typeof data?.identifier === 'string' && typeof data?.type === 'string' && typeof data?.deviceId === 'string' && typeof data?.text === 'string';
}

export async function startConsumer(channel: Channel) {
  const repo = AppDataSource.getRepository(FcmJob);

  channel.consume(env.rabbitmq.fcmQueue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    let data: any;
    try {
      data = JSON.parse(msg.content.toString());
    } catch {
      channel.ack(msg);
      return;
    }

    if (!isValid(data)) {
      channel.ack(msg);
      return;
    }

    // ✅ ACK setelah validasi (sesuai PDF)
    channel.ack(msg);

    try {
      await sendFCM(data.deviceId, data.text);

      const deliverAt = new Date();

      await repo.save({
        identifier: data.identifier,
        deliverAt
      });

      publishDone(channel, {
        identifier: data.identifier,
        deliverAt: deliverAt.toISOString()
      });

      console.log(`Processed successfully: ${data.identifier}`);
    } catch (err: any) {
      console.error(`FCM failed for ${data.identifier}:`, err?.errorInfo?.message || err.message);
    }
  });
}
