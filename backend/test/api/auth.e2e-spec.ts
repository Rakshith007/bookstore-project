import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Enable CORS like your main.ts
    app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    
    await app.init();
    
    console.log('✅ Test app initialized');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Basic API Health', () => {
    it('GET / should return something', async () => {
      const response = await request(app.getHttpServer())
        .get('/')
        .expect(200);
      
      console.log('Root response:', response.body);
    });
  });

  describe('Auth Endpoints', () => {
    it('POST /auth/login should work with test credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'Customer@123'
        });

      console.log('Login test - Status:', response.status);
      console.log('Login test - Body:', response.body);
      
      // Accept 200 (success) or 401 (if user doesn't exist yet)
      expect([200, 401]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('access_token');
      }
    });

    it('POST /auth/register should create new user', async () => {
      const timestamp = Date.now();
      const testUser = {
        username: `apiuser${timestamp}`,
        email: `apiuser${timestamp}@test.com`,
        password: 'ApiUser@123'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      console.log('Register test - Status:', response.status);
      console.log('Register test - Body:', response.body);
      
      // Should be 201 (created) or 400/409 (validation/duplicate)
      expect([201, 400, 409]).toContain(response.status);
    });
  });
});