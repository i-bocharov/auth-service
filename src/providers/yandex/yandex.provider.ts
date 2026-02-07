import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import { yandexConfig, YandexConfig } from '../../config/yandex.config';
import { OAuthProviderBase } from '../base/oauth.provider.base';
import { OAuthProfile } from '../../types/oauth';

/**
 * Провайдер аутентификации через Яндекс
 * @implements OAuthProviderBase
 * @security Работает только с официальным API Яндекса
 * @see https://yandex.ru/dev/id/doc/ru/user-information
 */
@Injectable()
export class YandexProvider extends OAuthProviderBase {
  readonly name = 'yandex' as const;

  constructor(
    @Inject(yandexConfig.KEY)
    private readonly config: YandexConfig,
    httpService: HttpService,
  ) {
    super(httpService);
  }

  /**
   * Получение access token от Яндекса
   */
  protected async getAccessToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    return this.exchangeCodeForToken(
      this.config.tokenUrl,
      this.config.clientId,
      this.config.clientSecret,
      code,
      redirectUri,
    );
  }

  /**
   * Получение профиля пользователя от Яндекса
   * @see https://yandex.ru/dev/id/doc/ru/user-information
   */
  protected async fetchUserProfile(accessToken: string): Promise<any> {
    const response = await this.httpService.axiosRef.get(
      this.config.userInfoUrl,
      {
        headers: {
          Authorization: `OAuth ${accessToken}`,
        },
        params: {
          format: 'json',
        },
      },
    );

    return response.data;
  }

  /**
   * Преобразование профиля Яндекса в универсальный формат
   */
  protected transformProfile(rawProfile: any): OAuthProfile {
    return {
      provider: 'yandex' as const,
      providerId: rawProfile.id,
      email: rawProfile.default_email || rawProfile.emails?.[0],
      firstName: rawProfile.first_name,
      lastName: rawProfile.last_name,
      displayName: rawProfile.display_name || rawProfile.real_name,
      avatarUrl: rawProfile.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${rawProfile.default_avatar_id}/islands-200`
        : undefined,
    };
  }
}
