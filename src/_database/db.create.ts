import { dbConnection } from './db.connect';

export class DbCreate {
  public async createDb(): Promise<void> {
    try {
      const createTablesQuery1 = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            cpf VARCHAR(14) UNIQUE NOT NULL,
            pass VARCHAR(255) NOT NULL,
            type ENUM('common', 'merchant') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ); `
      
        const createTablesQuery2 = `
        CREATE TABLE IF NOT EXISTS wallets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNIQUE NOT NULL,
            balance DECIMAL(10,2) DEFAULT 0.00,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ); `;

        const createTablesQuery3 = `
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT chk_sender_receiver CHECK (sender_id <> receiver_id)
        );
      `;

      const querys = [createTablesQuery1, createTablesQuery2, createTablesQuery3];

      for (let i = 0; i < querys.length; i++) {
        await new Promise<void>((resolve, reject) => {
          dbConnection.query(
            querys[i],
             (err, _) => {
              if (err) {
                console.error('Erro ao criar tabelas:', err);
                reject(err);
                return;
              }
              console.log(`Tabelas criadas ou já existentes.\nTabela: ${i + 1}`);
              resolve();
            }
          )
        });   
      }
    } catch (err: any) {
      console.error('Erro ao criar banco de dados:', err.message);
      throw err;
    }
  }
}
