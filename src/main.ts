import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ValidationError } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // ============================================
  // Получение конфигурации приложения
  // ============================================
  const appConfigData = configService.get<AppConfig>('APP_CONFIG');
  if (!appConfigData) {
    throw new Error('App configuration not found. KEY: APP_CONFIG');
  }

  const { port, environment, backendUrl } = appConfigData;

  // ============================================
  // CORS + Helmet
  // ============================================
  app.enableCors({
    origin: backendUrl,
    methods: ['POST'],
    credentials: false,
  });
  app.use(helmet());

  // ============================================
  // Rate limiting
  // ============================================
  app.use(
    '/auth/:provider',
    rateLimit({
      windowMs: 60 * 1000, // 1 минута
      max: 30, // максимум 30 запросов на IP в минуту
      message: 'Too many authentication attempts, please try again later.',
    }),
  );

  // ============================================
  // Global Validation Pipe
  // ============================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((err: ValidationError) =>
          Object.values(err.constraints || {}).join(', '),
        );
        return new Error(`Validation failed: ${messages.join('; ')}`);
      },
    }),
  );

  // ============================================
  // Swagger with BasicAuth
  // ============================================
  const swaggerUsername = process.env.SWAGGER_USER || 'admin';
  const swaggerPassword = process.env.SWAGGER_PASSWORD || 'admin';

  app.use(
    ['/api/docs', '/api/docs-json'],
    basicAuth({
      challenge: true,
      users: { [swaggerUsername]: swaggerPassword },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('OAuth Authentication Microservice')
    .setDescription(
      'Микросервис аутентификации через OAuth провайдеров\\n\\n' +
        '**ВАЖНО:** Этот микросервис предназначен ТОЛЬКО для внутреннего использования ' +
        'основным бэкендом. Прямые запросы от фронтенда запрещены.\\n\\n' +
        'Сейчас поддерживается: **Яндекс**\\n' +
        'Готов к расширению: Google, VKontakte, GitHub',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'Аутентификация через OAuth')
    .addServer(`http://localhost:${port}`, 'Development')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ============================================
  // Server logs
  // ============================================
  console.log('='.repeat(60));
  console.log('🚀 OAuth Authentication Microservice');
  console.log('='.repeat(60));
  console.log(`Environment: ${environment}`);
  console.log(`Port: ${port}`);
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`Swagger Docs: http://localhost:${port}/api/docs`);
  console.log('='.repeat(60));

  await app.listen(port);
}

bootstrap().catch((err: unknown) => {
  console.error(
    'Ошибка при запуске приложения:',
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
