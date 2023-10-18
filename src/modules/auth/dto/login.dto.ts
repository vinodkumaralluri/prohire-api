import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserType } from '../../../enums/user-type.enum';

export class LoginDto {
  @ApiProperty({ example: 'vinodkumaralluri@proservice.com', description: 'Email' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Admin@123', description: 'Password' })
  password: string;
}
