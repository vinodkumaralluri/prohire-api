import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CompanyDto {
  @ApiProperty({ example: 'Company-1', description: 'Name of the Company' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'company1@gmail.com', description: 'Email id of the Company' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9848682818', description: 'Phone number of the Company' })
  @IsNotEmpty()
  phone_number: string;

  // @ApiProperty({ example: 'E1', description: 'Id of the Instructor' })
  // @IsNotEmpty()
  // instructor: string;

}
