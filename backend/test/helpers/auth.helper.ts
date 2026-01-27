import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export class TestHelper {
  static async getAuthToken(
    app: INestApplication, 
    email: string, 
    password: string
  ): Promise<{ token: string; user: any }> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    
    return {
      token: response.body.access_token,
      user: response.body.user
    };
  }

  static async registerUser(
    app: INestApplication,
    userData: { username: string; email: string; password: string }
  ) {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userData);
  }

  static async verifyEmail(app: INestApplication, token: string) {
    return request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token });
  }

  static async getCustomerToken(app: INestApplication) {
    const result = await this.getAuthToken(app, 'customer@test.com', 'Customer@123');
    return result.token;
  }

  static async getAdminToken(app: INestApplication) {
    const result = await this.getAuthToken(app, 'admin@test.com', 'Admin@123');
    return result.token;
  }

  static async getWarehouseToken(app: INestApplication) {
    const result = await this.getAuthToken(app, 'warehouse@test.com', 'Warehouse@123');
    return result.token;
  }

  static async createBook(
    app: INestApplication,
    token: string,
    bookData: any
  ) {
    return request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `Bearer ${token}`)
      .send(bookData);
  }

  static async addToCart(
    app: INestApplication,
    token: string,
    bookId: number,
    quantity: number = 1
  ) {
    return request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ bookId, quantity });
  }
}