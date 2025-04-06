// dbmain.ts
import { Injectable } from '@nestjs/common';
import { dbConnection } from './db.connect';
import { User } from './types';

@Injectable()
export class DbMain {
  public async get(query: string, params: any[]): Promise<any> {
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

  public async getWallet(email: string): Promise<number> {
    try {
      const userId = await this.getId(email);
      if (!userId) {
        throw new Error('User not found');
      };

      const wallet = await this.get('SELECT * FROM wallets WHERE user_id = ?', [userId]);
      if (!wallet || wallet.length === 0) {
        throw new Error('Wallet not found');
      }

      return wallet[0].balance;
    } catch (walletError) {
      console.error('Error getting that wallet:', walletError);
      throw new Error('Error getting that wallet');
    }
  }

  public async verifyEmailPass(email: string, pass: string): Promise<boolean> {
    try {
      if (!email || !pass) {
        return false;
      }

      const query = 'SELECT id FROM users WHERE email = ? AND pass = ?';
      const result = await this.get(query, [email.trim(), pass.trim()]);

      return Array.isArray(result) && result.length > 0;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw new Error('Failed to verify credentials');
    }
  }

  public async transferAmmount(senderEmail: string, receiverEmail: string, ammount: number): Promise<boolean> {
    try {
      const typeSender = await this.getType(senderEmail);
      const senderId = await this.getId(senderEmail);
      const receiverId = await this.getId(receiverEmail);
      const senderBalance = await this.getWallet(senderEmail);

      /* Security Verifications */
      if (!ammount || ammount <= 0) {
        throw new Error('Invalid amount');
      }

      if (!senderId || !receiverId) {
        throw new Error('User not found');
      }

      if (typeSender === 'merchant') {
        throw new Error('Merchant users cant transfer amount');
      }

      if (senderBalance < ammount) {
        throw new Error('Insufficient funds');
      }


      return new Promise((resolve, reject) => {
        dbConnection.query(
          'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
          [ammount, senderId],
          (debitErr) => {
            if (debitErr) {
              console.error('Error debiting sender:', debitErr);
              reject(false);
              return;
            }

            dbConnection.query(
              'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
              [ammount, receiverId],
              (creditErr) => {
                if (creditErr) {
                  console.error('Error crediting receiver:', creditErr);
                  /* Rollback if error */
                  dbConnection.query(
                    'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
                    [ammount, senderId]
                  );
                  reject(false);
                  return;
                }


                dbConnection.query(
                  'INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (?, ?, ?)',
                  [senderId, receiverId, ammount],
                  (transErr) => {
                    if (transErr) {
                      console.error('Error recording transaction:', transErr);
                      reject(false);
                      return;
                    }
                    resolve(true);
                  }
                );
              }
            );
          }
        );
      });

    } catch (transferError) {
      console.error('Error transferring amount:', transferError);
      throw transferError;
    }
  }

  public async getTransactions(userId?: number): Promise<any[]> {
    try {
      let query = 'SELECT * FROM transactions';
      let params: any[] = [];

      if (userId) {
        query = 'SELECT * FROM transactions WHERE sender_id = ? OR receiver_id = ?';
        params = [userId, userId];
      }

      const transactions = await this.get(query, params);

      if (!transactions || transactions.length === 0) {
        console.debug('No transactions found');
        return [];
      }

      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  };

  public async getDb(): Promise<User[]> {
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
        console.error('Invalid CPF');
        throw new Error('Invalid CPF');
      }

      const results = await this.get('SELECT cpf FROM users WHERE cpf = ?', [cpf.toString()]);

      if (!results || results.length === 0) {
        console.debug('CPF not found');
        return false;
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

  public async depositByEmail(email: string, amount: number): Promise<boolean> {
    try {
      // Validações básicas
      if (!email || typeof email !== 'string') {
        throw new Error('Email inválido');
      }

      if (!amount || amount <= 0) {
        throw new Error('Valor de depósito inválido');
      }

      // Obter o ID do usuário pelo email
      const userId = await this.getId(email);

      if (!userId) {
        throw new Error('Usuário não encontrado');
      }

      // Atualizar o saldo na carteira
      return new Promise((resolve, reject) => {
        dbConnection.query(
          'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
          [amount, userId],
          (err) => {
            if (err) {
              console.error('Erro ao depositar valor:', err.message);
              reject(false);
              return;
            }

            resolve(true);
          }
        );
      });
    } catch (error) {
      console.error('Erro ao realizar depósito:', error);
      throw error;
    }
  }
}