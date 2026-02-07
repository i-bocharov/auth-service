import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { appConfig } from './config/app.config';
import { yandexConfig } from './config/yandex.config';

/**
 * Корневой модуль приложения
 */
@Module({
  imports: [
    // Глобальная конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, yandexConfig],
      envFilePath: ['.env'],
    }),

    // Модуль аутентификации
    AuthModule,
  ],
})
export class AppModule {}
