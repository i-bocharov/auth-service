import { ConfigType, registerAs } from '@nestjs/config';

/**
 * Основная конфигурация приложения
 * @description Централизованное управление настройками
 */
export const appConfig = registerAs('app', () => ({
  /**
   * Порт сервера
   * @default 3001
   * @environment PORT
   */
  port: parseInt(process.env.PORT, 10) || 3001,

  /**
   * Окружение
   * @default 'development'
   * @environment NODE_ENV
   */
  environment: process.env.NODE_ENV || 'development',

  /**
   * URL основного бэкенда (для CORS)
   * @default 'http://localhost:3000'
   * @environment BACKEND_URL
   */
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',

  /**
   * Белый список разрешённых redirect_uri
   * @environment ALLOWED_REDIRECT_URIS
   */
  allowedRedirectUris: process.env.ALLOWED_REDIRECT_URIS
    ? process.env.ALLOWED_REDIRECT_URIS.split(',')
    : ['http://localhost:3000/auth/callback'],

  /**
   * Флаг разработки
   */
  isDevelopment: process.env.NODE_ENV !== 'production',

  /**
   * Флаг продакшена
   */
  isProduction: process.env.NODE_ENV === 'production',
}));

/**
 * Типизированный конфиг приложения
 */
export type AppConfig = ConfigType<typeof appConfig>;
