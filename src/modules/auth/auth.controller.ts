import {
  Body,
  Controller,
  NotImplementedException,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CompanyDto } from '../company/dto/company.dto';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('Auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Signup API
  @Post('/createSuperAdmin')
  @ApiOperation({ summary: 'Super Admin Creation' })
  @ApiOkResponse({
    description: 'Super Admin Created Successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  async createSuperAdmin(@Body() companyDto: CompanyDto) {
    const superAdmin = await this.authService.createSuperAdmin(companyDto);
    if (superAdmin.status == true) {
      return { status: true, message: superAdmin.message, data: superAdmin.user_id };
    } else {
      throw new NotImplementedException(superAdmin.status);
    }
  }

  // Signup API
  @Post('/signup')
  @ApiOperation({ summary: 'Sign Up user' })
  @ApiOkResponse({
    description: 'User signed up Successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    const signup = await this.authService.signUp(signUpDto);
    if (signup.status == true) {
      return { status: true, message: 'User signed up successfully', data: signup.user_id };
    } else {
      throw new NotImplementedException(signup.status);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({
    description: 'User logged in successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const data = await this.authService.login(req.user);
    return { status: true, message: 'User logged in successfully', data };
  }

  @Post('/sendOtp')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send otp to user' })
  @ApiOkResponse({
    description: 'OTP sent to the registered mobile number',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  async sendOtp(@Request() req) {
    const data = await this.authService.sendOtp(req.user);
    return { message: 'OTP sent to the registered mobile number', data };
  }

  @Post('/verify/:otp')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiOkResponse({
    description: 'OTP verified',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  async verifyOtp(@Request() req, @Param('otp') otp: string) {
    const data = await this.authService.verifyOtp(req.user, otp);
    return { message: 'OTP verified', data };
  }

  @Post('/change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req,
  ) {
    const data = await this.authService.changePassword(
      req.user,
      changePasswordDto,
    );
    return { message: 'Password changed successfully', data };
  }

}
