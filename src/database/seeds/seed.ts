import { DataSource } from 'typeorm';
import { User, UserType, CommonUser, MerchantUser } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';

export const runSeeds = async (dataSource: DataSource): Promise<void> => {
    const userRepository = dataSource.getRepository(User);
    const walletRepository = dataSource.getRepository(Wallet);

    // Verificar se já existem dados
    const existingUsers = await userRepository?.count();
    if (existingUsers && existingUsers > 0) {
        console.log('Database already seeded. Skipping...');
        return;
    }

    console.log('Seeding database...');

    // Criar usuários comuns
    const commonUser1 = new CommonUser();
    commonUser1.fullName = 'João Silva';
    commonUser1.document = '12345678900';
    commonUser1.email = 'joao@example.com';
    commonUser1.password = 'password123'; // Em produção, usar hash
    commonUser1.type = UserType.COMMON;

    const commonUser2 = new CommonUser();
    commonUser2.fullName = 'Maria Souza';
    commonUser2.document = '98765432100';
    commonUser2.email = 'maria@example.com';
    commonUser2.password = 'password123'; // Em produção, usar hash
    commonUser2.type = UserType.COMMON;

    // Criar usuário lojista
    const merchantUser = new MerchantUser();
    merchantUser.fullName = 'Loja do José';
    merchantUser.document = '11122233344';
    merchantUser.email = 'loja@example.com';
    merchantUser.password = 'password123'; // Em produção, usar hash
    merchantUser.type = UserType.MERCHANT;

    // Criar carteiras
    const wallet1 = new Wallet();
    wallet1.balance = 1000;
    wallet1.user = commonUser1;
    commonUser1.wallet = wallet1;

    const wallet2 = new Wallet();
    wallet2.balance = 800;
    wallet2.user = commonUser2;
    commonUser2.wallet = wallet2;

    const wallet3 = new Wallet();
    wallet3.balance = 5000;
    wallet3.user = merchantUser;
    merchantUser.wallet = wallet3;

        try {
        await userRepository.save([commonUser1, commonUser2, merchantUser]);
        console.log('Database seeded successfully!');
        } catch (error) {
        console.log(`Error seeding database: ${error}`);
        }
};
