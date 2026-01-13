import amqp from 'amqplib';
import { AppDataSource } from '../../src/config/data-source';
import { FcmJob } from '../../src/entities/fcm-job.entity';

describe('FCM E2E Flow', () => {
  let connection: amqp.ChannelModel;
  let channel: amqp.Channel;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();
  });

  afterAll(async () => {
    await channel.close();
    await connection.close();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('should process message and persist to DB', async () => {
    const identifier = `test-${Date.now()}`;

    const payload = {
      identifier,
      type: 'device',
      deviceId: 'mock-device',
      text: 'Hello E2E'
    };

    channel.sendToQueue(process.env.RABBITMQ_FCM_QUEUE!, Buffer.from(JSON.stringify(payload)));

    // ⏳ Tunggu worker memproses
    await new Promise((res) => setTimeout(res, 1500));

    const repo = AppDataSource.getRepository(FcmJob);
    const job = await repo.findOneBy({ identifier });

    expect(job).toBeTruthy();
    expect(job?.deliverAt).toBeInstanceOf(Date);
  });
});
