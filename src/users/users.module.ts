import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, CommonUser, MerchantUser } from './entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, CommonUser, MerchantUser])],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }