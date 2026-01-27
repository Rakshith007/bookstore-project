import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

export async function createTestApp() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for tests
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Start on test port
  await app.listen(4001);
  return app;
}