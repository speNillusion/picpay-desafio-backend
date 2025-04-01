import { dbConnection } from './db.connect';

export function checkDb(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    dbConnection.query(
      "SHOW TABLES LIKE 'users';",
      async (err, results: string[]) => {
        if (err) {
          console.error('Erro ao verificar a tabela:', err.message);
          reject(false);
        }
        if (results.length === 0) {
          console.log('Tabela "users" não existe.');
          resolve(false);
        } else {
          console.log('Tabela "users" já existe.');
          resolve(true);
        }
      }
    );

    dbConnection.query(
      "SHOW TABLES LIKE 'wallets';",
      async (err, results: string[]) => {
        if (err) {
          console.error('Erro ao verificar a tabela:', err.message);
          reject(false);
        }
        if (results.length === 0) {
          console.log('Tabela "wallets" não existe.');
          resolve(false);
        } else {
          console.log('Tabela "wallets" já existe.');
          resolve(true);
        }
      }
    );

    dbConnection.query(
      "SHOW TABLES LIKE 'transactions';",
      async (err, results: string[]) => {
        if (err) {
          console.error('Erro ao verificar a tabela:', err.message);
          reject(false);
        }
        if (results.length === 0) {
          console.log('Tabela "transactions" não existe.');
          resolve(false);
        } else {
          console.log('Tabela "transactions" já existe.');
          resolve(true);
        }
      }
    );
  });
}
