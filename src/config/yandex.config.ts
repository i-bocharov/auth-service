import { ConfigType, registerAs } from '@nestjs/config';

/**
 * Конфигурация Яндекс OAuth
 * @description Настройки для работы с Яндекс ID API
 * @security Критически важные секреты хранятся только в .env
 * @see https://yandex.ru/dev/id/doc/ru/user-information
 */
export const yandexConfig = registerAs('yandex', () => {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const clientSecret = process.env.YANDEX_CLIENT_SECRET;

  // Валидация обязательных переменных
  if (!clientId) {
    throw new Error('YANDEX_CLIENT_ID is required in environment variables');
  }
  if (!clientSecret) {
    throw new Error(
      'YANDEX_CLIENT_SECRET is required in environment variables',
    );
  }

  return {
    /**
     * Client ID приложения в Яндекс OAuth
     */
    clientId,

    /**
     * Client Secret приложения
     * @security Никогда не логировать!
     */
    clientSecret,

    /**
     * URL авторизации Яндекса
     * @see https://yandex.ru/dev/id/doc/ru/codes/code-url
     */
    authUrl: 'https://oauth.yandex.ru/authorize' as const,

    /**
     * URL для обмена кода на токен
     * @see https://yandex.ru/dev/id/doc/ru/codes/code-url
     */
    tokenUrl: 'https://oauth.yandex.ru/token' as const,

    /**
     * URL для получения информации о пользователе
     * @see https://yandex.ru/dev/id/doc/ru/user-information
     */
    userInfoUrl: 'https://login.yandex.ru/info' as const,

    /**
     * Scope по умолчанию
     * @description Права доступа: логин, имя, фамилия, пол, email, аватар
     */
    defaultScope: 'login:info login:email login:avatar' as const,

    /**
     * Флаг включения Яндекс аутентификации
     */
    enabled: true as const,
  };
});

/**
 * Типизированный конфиг Яндекса
 */
export type YandexConfig = ConfigType<typeof yandexConfig>;
