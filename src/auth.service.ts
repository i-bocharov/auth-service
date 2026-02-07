import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { OAuthProviderFactory } from './providers/oauth.provider.factory';
import { OAuthProfile, OAuthProvider } from './types/oauth';

import {
  InvalidProviderException,
  InvalidRedirectUriException,
} from './exceptions/oauth.exception';

/**
 * Сервис аутентификации OAuth
 * @description Фасад над провайдерами с полной валидацией
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly providerFactory: OAuthProviderFactory,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  /**
   * Аутентификация через провайдера с полной валидацией
   */
  async authenticate(
    provider: OAuthProvider,
    code: string,
    redirectUri: string,
  ): Promise<OAuthProfile> {
    this.logger.log(
      `Authentication request for ${provider}, redirectUri: ${redirectUri}`,
    );

    // Валидация 1: Провайдер существует и включён
    this.validateProvider(provider);

    // Валидация 2: redirectUri в белом списке
    this.validateRedirectUri(redirectUri);

    // Получение провайдера
    const oauthProvider = this.providerFactory.getProvider(provider);

    // Аутентификация (валидация кода происходит внутри провайдера)
    const profile = await oauthProvider.authenticate(code, redirectUri);

    this.logger.log(
      `Authentication successful for ${provider}:${profile.providerId}`,
    );
    return profile;
  }

  /**
   * Валидация провайдера
   */
  private validateProvider(provider: OAuthProvider): void {
    const availableProviders = this.providerFactory.getAvailableProviders();
    if (!availableProviders.includes(provider)) {
      this.logger.warn(`Invalid provider requested: ${provider}`);
      throw new InvalidProviderException(provider);
    }
  }

  /**
   * Валидация redirectUri против белого списка
   * @security Защита от атаки open redirect
   */
  private validateRedirectUri(uri: string): void {
    if (!this.config.allowedRedirectUris.includes(uri)) {
      this.logger.warn(`Blocked invalid redirect_uri: ${uri}`);
      throw new InvalidRedirectUriException(uri);
    }
    this.logger.debug(`Redirect URI validated: ${uri}`);
  }

  /**
   * Получение списка доступных провайдеров
   */
  getAvailableProviders(): OAuthProvider[] {
    return this.providerFactory.getAvailableProviders();
  }
}
