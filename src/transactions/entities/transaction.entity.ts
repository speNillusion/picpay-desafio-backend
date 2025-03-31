import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    value: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'payer_id' })
    payer: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'payee_id' })
    payee: User;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @Column({ nullable: true })
    failureReason: string;

    @CreateDateColumn()
    createdAt: Date;
}