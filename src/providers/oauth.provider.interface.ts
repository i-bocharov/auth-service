import { OAuthProfile } from '../types/oauth';

/**
 * Базовый интерфейс для всех OAuth провайдеров
 * @description Единый контракт для всех провайдеров (готов к расширению)
 */
export interface OAuthProviderInterface {
  /**
   * Название провайдера
   */
  readonly name: string;

  /**
   * Обмен кода авторизации на профиль пользователя
   * @param code - Код авторизации от провайдера
   * @param redirectUri - URI редиректа
   * @returns Профиль пользователя
   */
  authenticate(code: string, redirectUri: string): Promise<OAuthProfile>;
}
