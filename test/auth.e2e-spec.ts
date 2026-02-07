import { config } from 'dotenv';
import { resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

// Загружаем тестовые переменные окружения с типобезопасным путём
config({
  path: resolve(__dirname, '..', '.env.test'),
});

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/auth/providers (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/providers')
      .expect(200);

    expect(res.body).toContain('yandex');
  });

  it('/auth/yandex with invalid redirect (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/yandex')
      .send({ code: 'test', redirectUri: 'http://malicious.com' })
      .expect(400);
  });
});
