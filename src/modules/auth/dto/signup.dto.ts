import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserType } from '../../../enums/user-type.enum';

export class SignUpDto {

  @ApiProperty({ example: '984293739', description: 'Phone Number' })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: 'john@john.com', description: 'Email' })
  @Transform(({ value }: TransformFnParams) => value.trim())
  @Matches(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  )
  email: string;

  @ApiProperty({ example: 'Super Admin', description: 'User Type' })
  @IsEnum(UserType, {
    message: 'Invalid user type',
  })
  user_type: UserType;

  @ApiProperty({ example: 'Admin!23', description: 'Password' })
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
  //   {
  //     message:
  //       'Password should contain at least 1 Uppercase, 1 Lowercase, 1 Special Character, 1 Number and minimum length should be 8',
  //   },
  // )
  password: string;

}
