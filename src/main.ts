import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // ============================================
  // CORS configuration
  // ============================================
  const backendUrl = configService.get<string>(
    `${String(appConfig.KEY)}.backendUrl`,
  );
  app.enableCors({
    origin: backendUrl,
    methods: 'POST',
    credentials: false,
  });

  // ============================================
  // Global validation pipe
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
      exceptionFactory: (errors) => {
        const messages = errors.map((err) =>
          Object.values(err.constraints || {}).join(', '),
        );
        return new Error(`Validation failed: ${messages.join('; ')}`);
      },
    }),
  );

  // ============================================
  // Swagger documentation
  // ============================================
  const config = new DocumentBuilder()
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
    .addServer('http://localhost:3001', 'Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ============================================
  // Server configuration
  // ============================================
  const port = configService.get<number>(`${String(appConfig.KEY)}.port`);
  const environment = configService.get<string>(
    `${String(appConfig.KEY)}.environment`,
  );

  console.log('\\n' + '='.repeat(60));
  console.log('🚀 OAuth Authentication Microservice');
  console.log('='.repeat(60));
  console.log(`Environment: ${environment}`);
  console.log(`Port: ${port}`);
  console.log(`Backend URL: ${backendUrl}`);
  console.log(`Swagger Docs: http://localhost:${port}/api/docs`);
  console.log('='.repeat(60) + '\\n');

  await app.listen(port || 3000);
}

bootstrap().catch((err) => {
  console.error('Ошибка при запуске приложения:', err);
  process.exit(1); // Завершаем процесс с кодом ошибки
});
