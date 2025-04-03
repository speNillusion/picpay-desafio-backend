// dbmain.ts
import { Injectable } from '@nestjs/common';
import { dbConnection } from './db.connect';

@Injectable()
export class DbMain {
  public async get(query: string, params: (string[] | string)): Promise<any> {
    return new Promise((resolve, reject) => {
      dbConnection.query(query, params, (err, row) => {
        if (err) {
          console.error('Erro ao consultar dados:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /*
  # FEITO   1° --> Fix function with try/catch and throw error;
  2° --> Create a function to get wallet from user by email:
         func getWalletByEmail(email: string): -> get id from email, after get wallet from id, finally return wallet;
  3° --> Create a function to make transactions:
         func transferAmmount(emailCommonUser: number, emailMerchantUser): 
        ---> getWalletByEmail(emailCommonUser) | getWalletByEmail(emailMe), verify if ammount is valid,
                                                                            positive, and if user have enough money,
                                                                            merchant users wont be able to transfer, him only receipe transfers,
                                                                            ammount will be deducted from common user and added to merchant user,
                                                                            after that, a transaction will be incremented in transactions table,
                                                                            with common user id, merchant user id, ammount, and where out, where entry ids,
                                                                            finally return Promise(resolve, reject) -> to user;
        ---> to debugLevel console.log() --> errors and Logs;

  4° --> Create a function to get transactions by user id:
         func getTransactionsByUserId(userId: number):
        ---> get all transactions from user id, after that, return Promise(resolve, reject) -> to user;
        ---> to debugLevel console.log() --> errors and Logs;

  5° --> Create a function to get all transactions:
         func getAllTransactions():
        ---> get all transactions, after that, return Promise(resolve, reject) -> to user;
        ---> to debugLevel console.log() --> errors and Logs;
  */

  public async getDb(): Promise<string[]> {
    try {
      const results = await this.get('SELECT * FROM users', []);
      return results;
    } catch (error) {
      console.error('Error getting DB:', error);
      throw error;
    }
  }

  public async getType(email: string): Promise<string> {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email');
      }
      
      const results = await this.get('SELECT type FROM users WHERE email = ?', [email.trim()]);
      
      if (!results || results.length === 0) {
        throw new Error('Type not found');
      }
      
      return results[0].type;
    } catch (error) {
      console.error('Error getting Type:', error);
      throw error;
    }
  }

  public async cpfNotRepeat(cpf: number): Promise<boolean> {
    try {
      if (!cpf || typeof cpf !== 'number') {
        throw new Error('Invalid CPF');
      }
      
      const results = await this.get('SELECT cpf FROM users WHERE cpf = ?', [cpf.toString()]);
      
      if (!results || results.length === 0) {
        throw new Error('CPF not found');
      }
      
      return results.length > 0;
    } catch (error) {
      console.error('Error getting ID:', error);
      throw error;
    }
  }

  public async getId(email: string): Promise<number> {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email');
      }

      const results = await this.get('SELECT id FROM users WHERE email = ?', [email.trim()]);

      if (!results || results.length === 0) {
        throw new Error('User not found');
      }

      return results[0].id;
    } catch (error) {
      console.error('Error getting ID:', error);
      throw error;
    }
  }

  public async pushDb(nome: string, email: string, pass: string, cpf: number, type: string): Promise<boolean> {
    try {
      return new Promise((resolve, reject) => {
        /* part code to create user */
        dbConnection.query(
          'INSERT INTO users (name, email, pass, cpf, type) VALUES (?, ?, ?, ?, ?)',
          [nome, email, pass, cpf, type],
          async (err) => {
            if (err) {
              console.error('Error inserting data:', err.message);
              reject(false);
            } else {
              try {
                /* part code to create wallet to user */
                const userId = await this.getId(email);
                dbConnection.query(
                  'INSERT INTO wallets (user_id) VALUES (?)',
                  [userId],
                  (walletErr) => {
                    if (walletErr) {
                      console.error('Error creating wallet:', walletErr.message);
                      reject(false);
                    } else {
                      console.log('User and wallet created successfully');
                      resolve(true);
                    }
                  }
                );
              } catch (idError) {
                console.error('Error getting user ID:', idError);
                reject(false);
              }
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in pushDb:', error);
      return false;
    }
  }
}