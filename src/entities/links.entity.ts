import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Click } from './clicks.entity';
import { User } from './user.entity';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  long_url: string;

  @Column({ unique: true })
  short_url: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Click, click => click.link)
  clicks: Click[];
}
