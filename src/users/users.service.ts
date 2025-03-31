import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findById(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['wallet'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async isMerchant(userId: number): Promise<boolean> {
        const user = await this.findById(userId);
        return user.type === UserType.MERCHANT;
    }
}