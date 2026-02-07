import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, Matches } from 'class-validator';
import { OAuthProvider } from '../types/oauth';

/**
 * DTO для запроса аутентификации с полной валидацией
 */
export class AuthRequestDto {
  @ApiProperty({
    description:
      'Код авторизации от провайдера (10-255 символов, alphanumeric)',
    example: '4_7K8aBcDeFgHiJkLmNoPqRsTuVwXyZ',
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  @Matches(/^[a-zA-Z0-9_-]{10,255}$/, {
    message:
      'Invalid authorization code format (must be 10-255 alphanumeric characters)',
  })
  code: string;

  @ApiProperty({
    description:
      'URI редиректа (должен совпадать с зарегистрированным в провайдере)',
    example: 'http://localhost:3000/auth/callback',
  })
  @IsUrl({}, { message: 'Invalid redirect URI format' })
  @IsNotEmpty({ message: 'Redirect URI is required' })
  redirectUri: string;
}

/**
 * DTO для ответа профиля
 */
export class UserProfileDto {
  @ApiProperty({
    description: 'Название провайдера',
    enum: ['yandex', 'google', 'vkontakte', 'github'],
    example: 'yandex',
  })
  provider: OAuthProvider;

  @ApiProperty({
    description: 'Уникальный идентификатор пользователя у провайдера',
    example: '1000034426',
  })
  providerId: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Отображаемое имя',
    example: 'ivan',
    required: false,
  })
  displayName?: string;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://avatars.yandex.net/get-yapic/12345/islands-200',
    required: false,
  })
  avatarUrl?: string;
}
