import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('User OIDC (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/user/login-oidc should redirect and set signed state cookie', async () => {
    const res = await request(app.getHttpServer()).get('/api/user/login-oidc');
    expect(res.status).toBe(302);
    expect(res.headers['set-cookie']).toBeDefined();
  const setCookie = res.headers['set-cookie'];
  const cookies = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie);
  expect(cookies).toContain('oidc_state');
  });
});
