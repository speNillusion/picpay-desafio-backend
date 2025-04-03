// dbmain.ts
import { Injectable } from '@nestjs/common';
import { dbConnection } from './db.connect';
import { Cripto } from 'src/users/DTO/dto.cripto';

@Injectable()
export class DbMain {
  public async get(query: string, params: string[]): Promise<any> {
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

  public async getDb(): Promise<any[]> {
    return this.get('SELECT * FROM users', []);
  }

  public async getType(email: string): Promise<string> {
    const results = await this.get('SELECT type FROM users WHERE email = ?', [email]);
    return results.length ? results[0].type : '';
  }

  public async cpfNotRepeat(cpf: number): Promise<boolean> {
    const results = await this.get('SELECT cpf FROM users WHERE cpf = ?', [cpf.toString()]);
    return results.length > 0;
  }

  public async getId(email: string): Promise<number | null> {
    try {
      const results = await this.get('SELECT id FROM users WHERE email = ?', [email]);
      return results
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  public async pushDb(nome: string, email: string, pass: string, cpf: number, type: string): Promise<boolean> {
    // const decryptedEmail = new Cripto().decrypt(email);
    // const userId = await this.getId(decryptedEmail);
    // console.log(userId);
    // console.log(email)

    /* NEED FIX THAT, TO CREATE WALLET TOGHETHER ACCOUNT COMMON AND MERCHANT USERS */

    return new Promise((resolve, reject) => {
      dbConnection.query(
        'INSERT INTO users (name, email, pass, cpf, type) VALUES (?, ?, ?, ?, ?)',
        [nome, email, pass, cpf, type],
        (err) => {
          if (err) {
            console.error('Erro ao inserir dados:', err.message);
            reject(false);
          } else {
            console.log('Dados inseridos com sucesso.');
            resolve(true);
          }
        }
      );

      // dbConnection.query(
      //   'INSERT INTO wallets (user_id) VALUES (?)',
      //   [userId],
      //   (err) => {
      //     if (err) {
      //       console.error('Erro ao inserir wallet:', err.message);
      //       reject(false);
      //     } else {
      //       console.log('wallet inserido com sucesso.');
      //       resolve(true);
      //     }
      //   }
      // );
    });
  }
}