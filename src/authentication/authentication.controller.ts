import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/user.dto';

import { UserEntity } from 'src/users/user.entity';
import { RegistrationDto } from './dtos/registration.dto';
import { AuthenticationService } from './authentication.service';
import { LocalAuthenticationGuard } from './guard/authentication.guard';
import RequestWithUser from './interfaces/request-with-user.interface';
import JwtAuthenticationGuard from './guard/jwt-authentication.guard';

@Controller('authentication')
@ApiTags('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(@Req() request: RequestWithUser): Promise<UserEntity> {
    const { user } = request;

    return user;
  }

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: CreateUserDto,
    description: 'Successfully created user',
  })
  @ApiBadRequestResponse({
    description: 'User with that email already exists.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async registration(
    @Body()
    registrationDto: RegistrationDto,
  ): Promise<UserEntity> {
    return this.authenticationService.registration(registrationDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthenticationGuard)
  @ApiOkResponse({
    type: CreateUserDto,
    description: 'Successfully authenticated',
  })
  @ApiBadRequestResponse({
    description: 'User with that credentials does not exist.',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async login(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<void> {
    const { user } = request;

    const cookie = this.authenticationService.getCookieWithJwtToken(user.id);

    response.setHeader('Set-Cookie', cookie);
    response.send({ result: true });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthenticationGuard)
  @ApiOkResponse({
    type: CreateUserDto,
    description: 'Successfully logged out',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async logout(@Res() response: Response): Promise<void> {
    const cookie = this.authenticationService.getCookieForLogout();

    response.setHeader('Set-Cookie', cookie);
    response.send({ result: true });
  }
}
