import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Link } from './links.entity';

@Entity('clicks')
export class Click {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Link, link => link.clicks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'link_id' })
  link: Link;

  @Column({ name: 'link_id' })  
  linkId: number;  

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  location: string;
}
