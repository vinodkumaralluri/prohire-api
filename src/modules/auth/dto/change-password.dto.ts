import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Admin!23', description: 'Password' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
    {
      message:
        'Password should contain at least 1 Uppercase, 1 Lowercase, 1 Special Character, 1 Number and minimum length should be 8',
    },
  )
  password: string;
}
