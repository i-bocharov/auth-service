import { Injectable, Logger, HttpService } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import {
  OAuthProviderInterface,
  OAuthProfile,
} from '../oauth.provider.interface';

/**
 * Абстрактный базовый класс для всех OAuth провайдеров
 * @description Содержит общую логику обмена кода на токен
 * @security Все запросы проходят через этот базовый класс
 */
@Injectable()
export abstract class OAuthProviderBase implements OAuthProviderInterface {
  protected readonly logger: Logger;
  private readonly httpService: HttpService;

  constructor(httpService: HttpService) {
    this.logger = new Logger(this.constructor.name);
    this.httpService = httpService;
  }

  abstract readonly name: string;

  /**
   * Обмен кода авторизации на access token
   * @param tokenUrl - URL для обмена кода на токен
   * @param clientId - Client ID провайдера
   * @param clientSecret - Client Secret провайдера
   * @param code - Код авторизации
   * @param redirectUri - URI редиректа
   * @returns Access token
   */
  protected async exchangeCodeForToken(
    tokenUrl: string,
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string,
  ): Promise<string> {
    this.logger.debug(`Exchanging code for token, redirectUri: ${redirectUri}`);

    try {
      const response: AxiosResponse<any> = await this.httpService.axiosRef.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.debug('Token exchange successful');
      return response.data.access_token;
    } catch (error) {
      this.logger.error('Token exchange failed', error.response?.data);
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /**
   * Получение профиля пользователя по access token
   * @param accessToken - Access token
   * @returns Профиль пользователя (провайдер-специфичный)
   */
  protected abstract fetchUserProfile(accessToken: string): Promise<any>;

  /**
   * Преобразование провайдер-специфичного профиля в универсальный формат
   * @param rawProfile - Сырые данные от провайдера
   * @returns Универсальный профиль
   */
  protected abstract transformProfile(rawProfile: any): OAuthProfile;

  /**
   * Полный процесс аутентификации
   */
  async authenticate(code: string, redirectUri: string): Promise<OAuthProfile> {
    this.logger.log(`Authenticating with ${this.name}`);

    // Шаг 1: Обмен кода на токен (реализуется в дочернем классе)
    const accessToken = await this.getAccessToken(code, redirectUri);

    // Шаг 2: Получение профиля
    const rawProfile = await this.fetchUserProfile(accessToken);

    // Шаг 3: Преобразование в универсальный формат
    const profile = this.transformProfile(rawProfile);

    this.logger.log(`Authentication successful for user ${profile.providerId}`);
    return profile;
  }

  /**
   * Получение access token (реализуется в дочернем классе)
   */
  protected abstract getAccessToken(
    code: string,
    redirectUri: string,
  ): Promise<string>;
}
