import { OAuthProviderFactory } from './oauth.provider.factory';
import type { OAuthProfile } from '../types/oauth';

describe('OAuthProviderFactory', () => {
  let factory: OAuthProviderFactory;

  beforeEach(() => {
    const mockProvider = {
      name: 'yandex' as const,
      authenticate: jest.fn().mockResolvedValue({
        provider: 'yandex',
        providerId: '123',
        email: 'test@yandex.ru',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatarUrl: undefined,
      } satisfies OAuthProfile),
    };

    factory = new OAuthProviderFactory(
      mockProvider as unknown as OAuthProviderFactory['yandexProvider'],
    );
  });

  it('should return a provider by name', () => {
    const provider = factory.getProvider('yandex');
    expect(provider.name).toBe('yandex');
  });

  it('should throw error for unknown provider', () => {
    expect(() => factory.getProvider('google' as never)).toThrow(
      /OAuth provider 'google' not found/,
    );
  });

  it('should list available providers', () => {
    const providers = factory.getAvailableProviders();
    expect(providers).toEqual(['yandex']);
  });
});
