/**
 * Базовые типы для OAuth аутентификации
 * @description Готовы к расширению для других провайдеров
 */

/**
 * Провайдеры аутентификации
 * @description Добавляй новые провайдеры сюда
 */
export type OAuthProvider = 'yandex' | 'google' | 'vkontakte' | 'github';

/**
 * Универсальный профиль пользователя
 * @description Стандартизированный формат для всех провайдеров
 */
export interface OAuthProfile {
  /**
   * Название провайдера
   */
  provider: OAuthProvider;

  /**
   * Уникальный идентификатор пользователя у провайдера
   */
  providerId: string;

  /**
   * Email пользователя
   */
  email?: string;

  /**
   * Имя пользователя
   */
  firstName?: string;

  /**
   * Фамилия пользователя
   */
  lastName?: string;

  /**
   * Отображаемое имя
   */
  displayName?: string;

  /**
   * URL аватара
   */
  avatarUrl?: string;
}
