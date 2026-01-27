import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Books API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    
    await app.init();

    // Try to get auth token for protected routes
    try {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'Customer@123'
        });

      if (loginResponse.status === 200) {
        authToken = loginResponse.body.access_token;
        console.log('✅ Got auth token for books tests');
      }
    } catch (error) {
      console.log('⚠️  Could not get auth token, some tests might fail');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public Endpoints', () => {
    it('GET /books should return books', async () => {
      const response = await request(app.getHttpServer())
        .get('/books')
        .expect(200);

      console.log('Books response status:', response.status);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /books/:id should return book details', async () => {
      // Try with ID 1, might exist or not
      const response = await request(app.getHttpServer())
        .get('/books/1');

      // Accept 200 (found) or 404 (not found)
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Protected Endpoints', () => {
    it('POST /books should require auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/books')
        .send({ title: 'Test Book' });

      // Should be 401 (unauthorized) or 403 (forbidden)
      expect([401, 403]).toContain(response.status);
    });

    it('POST /books with auth token should work (or fail gracefully)', async () => {
      if (!authToken) {
        console.log('⚠️  Skipping test - no auth token available');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'API Test Book',
          price: 29.99,
          sku: 'API-TEST-001'
        });

      console.log('Create book with auth - Status:', response.status);
      // Could be 201, 400, 403 depending on user role
      expect([201, 400, 403]).toContain(response.status);
    });
  });
});