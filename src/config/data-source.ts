import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { FcmJob } from '../entities/fcm-job.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.mysql.host,
  port: env.mysql.port,
  username: env.mysql.username,
  password: env.mysql.password,
  database: env.mysql.database,
  entities: [FcmJob],
  synchronize: true // aman untuk test
});
