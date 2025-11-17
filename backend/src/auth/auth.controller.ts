// backend/src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
// import { CreateAdminDto } from './dto/create-admin.dto'; // <-- ELIMINADO

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /* --- ENDPOINT ELIMINADO ---
  @Post('signup')
  signup(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.signup(createAdminDto.email, createAdminDto.password);
  }
  */
}