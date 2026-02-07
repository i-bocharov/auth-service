import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OAuthProviderFactory } from './providers/oauth.provider.factory';
import { appConfig } from './config/app.config';
import type { OAuthProfile } from './types/oauth';
import {
  InvalidProviderException,
  InvalidRedirectUriException,
} from './exceptions/oauth.exception';

describe('AuthService', () => {
  let service: AuthService;
  let authenticateMock: jest.Mock;
  let getProviderMock: jest.Mock;
  let getAvailableProvidersMock: jest.Mock;

  const mockProfile: OAuthProfile = {
    provider: 'yandex',
    providerId: '123',
    email: 'test@yandex.ru',
    firstName: 'Test',
    lastName: 'User',
    displayName: 'Test User',
    avatarUrl: 'https://avatars.yandex.net/test',
  };

  beforeEach(async () => {
    authenticateMock = jest.fn().mockResolvedValue(mockProfile);
    getProviderMock = jest.fn().mockReturnValue({
      name: 'yandex',
      authenticate: authenticateMock,
    });
    getAvailableProvidersMock = jest.fn().mockReturnValue(['yandex']);

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(appConfig)],
      providers: [
        AuthService,
        {
          provide: OAuthProviderFactory,
          useValue: {
            getProvider: getProviderMock,
            getAvailableProviders: getAvailableProvidersMock,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('authenticate', () => {
    it('should authenticate successfully with valid provider and redirectUri', async () => {
      const profile = await service.authenticate(
        'yandex',
        'valid_code',
        'http://localhost:3000/auth/callback',
      );

      expect(profile).toEqual(mockProfile);
      expect(authenticateMock).toHaveBeenCalledWith(
        'valid_code',
        'http://localhost:3000/auth/callback',
      );
    });

    it('should throw InvalidProviderException for unknown provider', async () => {
      getProviderMock.mockReturnValue(undefined);

      await expect(
        service.authenticate(
          'google',
          'code',
          'http://localhost:3000/auth/callback',
        ),
      ).rejects.toThrow(InvalidProviderException);
    });

    it('should throw InvalidRedirectUriException for unauthorized redirectUri', async () => {
      await expect(
        service.authenticate('yandex', 'code', 'http://malicious.com'),
      ).rejects.toThrow(InvalidRedirectUriException);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of available providers', () => {
      const providers = service.getAvailableProviders();
      expect(providers).toEqual(['yandex']);
      expect(getAvailableProvidersMock).toHaveBeenCalled();
    });
  });
});
