import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, TableInheritance, ChildEntity } from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';

export enum UserType {
    COMMON = 'common',
    MERCHANT = 'merchant',
}

@Entity('users')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    fullName: string;

    @Column({ length: 14, unique: true })
    document: string; // CPF/CNPJ

    @Column({ length: 100, unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserType,
    })
    type: UserType;

    @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
    @JoinColumn()
    wallet: Wallet;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

@ChildEntity(UserType.COMMON)
export class CommonUser extends User {
    constructor() {
        super();
        this.type = UserType.COMMON;
    }
}

@ChildEntity(UserType.MERCHANT)
export class MerchantUser extends User {
    constructor() {
        super();
        this.type = UserType.MERCHANT;
    }
}