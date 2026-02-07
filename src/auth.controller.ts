import {
  Controller,
  Post,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { OAuthProvider } from './types/oauth';
import { AuthRequestDto, UserProfileDto } from './dto/auth.dto';

/**
 * Контроллер аутентификации
 * @description Работает с любым провайдером OAuth (готов к расширению)
 * @security Только внутренние запросы от основного бэкенда
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Аутентификация через OAuth провайдера
   * @param provider - Название провайдера (сейчас только 'yandex')
   * @param dto - Данные для аутентификации
   * @returns Профиль пользователя
   */
  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Аутентификация через OAuth провайдера',
    description:
      'Обменивает код авторизации на профиль пользователя.\n' +
      'Сейчас поддерживается только: yandex\n' +
      'В будущем: google, vkontakte, github',
  })
  @ApiParam({
    name: 'provider',
    type: String,
    enum: ['yandex'],
    description: 'Название OAuth провайдера',
  })
  @ApiBody({ type: AuthRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя успешно получен',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Невалидный код авторизации, провайдер или redirect_uri',
  })
  @ApiResponse({
    status: 404,
    description: 'Провайдер не найден',
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера',
  })
  async authenticate(
    @Param('provider') provider: OAuthProvider,
    @Body() dto: AuthRequestDto,
  ): Promise<UserProfileDto> {
    const profile = await this.authService.authenticate(
      provider,
      dto.code,
      dto.redirectUri,
    );

    return profile;
  }

  /**
   * Получение списка доступных провайдеров
   */
  @Post('providers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Получение списка доступных OAuth провайдеров',
  })
  @ApiResponse({
    status: 200,
    description: 'Список провайдеров',
    schema: {
      example: ['yandex'],
    },
  })
  getAvailableProviders(): OAuthProvider[] {
    return this.authService.getAvailableProviders();
  }
}
