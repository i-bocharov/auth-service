import { Injectable, Logger } from '@nestjs/common';
import { OAuthProvider } from '../types/oauth';
import { OAuthProviderInterface } from './oauth.provider.interface';
import { YandexProvider } from './yandex/yandex.provider';

/**
 * Фабрика для создания провайдеров OAuth
 * @description Готова к расширению — просто добавь новый провайдер в конструктор
 */
@Injectable()
export class OAuthProviderFactory {
  private readonly logger = new Logger(OAuthProviderFactory.name);
  private readonly providers = new Map<string, OAuthProviderInterface>();

  constructor(private readonly yandexProvider: YandexProvider) {
    // Регистрация всех провайдеров
    this.providers.set('yandex', yandexProvider);

    this.logger.log(`Registered ${this.providers.size} OAuth provider(s)`);
  }

  /**
   * Получение провайдера по имени
   * @param provider - Название провайдера
   * @returns Провайдер
   * @throws Error если провайдер не найден
   */
  getProvider(provider: OAuthProvider): OAuthProviderInterface {
    const providerInstance = this.providers.get(provider);

    if (!providerInstance) {
      this.logger.error(`Provider not found: ${provider}`);
      throw new Error(`OAuth provider '${provider}' not found`);
    }

    this.logger.debug(`Provider retrieved: ${provider}`);
    return providerInstance;
  }

  /**
   * Получение списка всех доступных провайдеров
   */
  getAvailableProviders(): OAuthProvider[] {
    return Array.from(this.providers.keys()) as OAuthProvider[];
  }
}
