import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Link } from './links.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed password

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Link, link => link.user)
  links: Link[];
}
