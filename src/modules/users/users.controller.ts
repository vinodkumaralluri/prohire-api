import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Query,
  Request,
  Put,
  NotImplementedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from '../../enums/user-type.enum';

@Controller({
  path: 'users',
  version: '1',
})
@ApiTags('User')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // GET User by User_id
  @Get(':user_id')
  @ApiOperation({ summary: 'Get User details' })
  @ApiOkResponse({
    description: 'User details fetched successfully'
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid/Expired token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('user_id') user_id: string) {
    const user = await this.usersService.findByUserId(user_id);
    return { message: 'User details fetched successfully.', data: user };
  }

  // GET Users
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiOperation({ summary: 'Get users list' })
  @ApiOkResponse({
    description: 'Users fetched successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid/Expired token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Request() req,
    @Query('page') page,
    @Query('limit') limit,
    @Query('search') search,
  ) {
    const users = await this.usersService.getUsers(
      req.user,
      page,
      limit,
      search,
    );
    return { message: 'Users fetched successfully.', data: users };
  }

  // Update User
  @Put('/:user_id')
  @ApiOperation({ summary: 'Update User' })
  @ApiOkResponse({
    description: 'User updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Request() req,
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.update(
      user_id,
      updateUserDto,
      req.user,
      req.user.permissions,
    );
    return { message: 'User updated successfully', data: true };
  }

  // Delete User
  @Put('/delete_user/:user_id')
  @ApiOperation({ summary: 'Delete User' })
  @ApiOkResponse({
    description: 'User deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Request() req, @Param('user_id') user_id: string) {
    await this.usersService.deleteUser(user_id, req.user, req.user.permissions);
    return { message: 'User deleted successfully', data: true };
  }

  // Restore User
  @Put('/restore_user/:user_id')
  @ApiOperation({ summary: 'Restore User' })
  @ApiOkResponse({
    description: 'User restored successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Technical error while processing',
  })
  @UseGuards(JwtAuthGuard)
  async restoreUser(@Request() req, @Param('user_id') user_id: string) {
    await this.usersService.restoreUser(user_id, req.user, req.user.permissions);
    return { message: 'User restored successfully', data: true };
  }


}
