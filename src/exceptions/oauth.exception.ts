import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Базовое исключение для ошибок OAuth
 */
export class OAuthException extends HttpException {
  constructor(
    message: string,
    error?: string,
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super(
      {
        message,
        error,
        statusCode: status,
      },
      status,
    );
  }
}

/**
 * Исключение для невалидного кода авторизации
 */
export class InvalidCodeException extends OAuthException {
  constructor() {
    super('Invalid authorization code', 'INVALID_CODE', HttpStatus.BAD_REQUEST);
  }
}

/**
 * Исключение для невалидного провайдера
 */
export class InvalidProviderException extends OAuthException {
  constructor(provider: string) {
    super(
      `Invalid OAuth provider: ${provider}`,
      'INVALID_PROVIDER',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Исключение для невалидного redirect_uri
 */
export class InvalidRedirectUriException extends OAuthException {
  constructor(uri: string) {
    super(
      `Invalid redirect_uri: ${uri}`,
      'INVALID_REDIRECT_URI',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Исключение для отсутствия профиля
 */
export class ProfileNotFoundException extends OAuthException {
  constructor() {
    super('User profile not found', 'PROFILE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
