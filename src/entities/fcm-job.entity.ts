import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'fcm_job' })
export class FcmJob {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  identifier!: string;

  @Column({ type: 'datetime' })
  deliverAt!: Date;
}
