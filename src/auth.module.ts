import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthProviderFactory } from './providers/oauth.provider.factory';
import { YandexProvider } from './providers/yandex/yandex.provider';
import { yandexConfig } from './config/yandex.config';

/**
 * Модуль аутентификации
 * @description Поддерживает OAuth провайдеров (сейчас только Яндекс)
 */
@Module({
  imports: [
    // Конфигурация Яндекса
    ConfigModule.forFeature(yandexConfig),

    // HTTP клиент для запросов к провайдерам
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OAuthProviderFactory, YandexProvider],
  exports: [AuthService],
})
export class AuthModule {}
