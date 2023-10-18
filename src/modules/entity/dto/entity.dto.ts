import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EntityType } from 'src/enums/entity-type.enum';
import { Gender } from 'src/enums/gender.enum';

export class EntityDto {
  @ApiProperty({ example: 'Company', description: 'Type of the Entity' })
  @IsEnum(EntityType)
  @IsNotEmpty()
  entity_type: EntityType;

  @ApiProperty({ example: 'Philips', description: 'Name of the Company' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'philips@gmail.com', description: 'Email of the Company' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9848484848', description: 'Contact of the Company' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '29-2-12/5', description: 'House number of the Company' })
  @IsNotEmpty()
  house_no: string;

  @ApiProperty({ example: 'Nehru street', description: 'Street of the Company' })
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'Prashanthi hills', description: 'Area of the Company' })
  @IsNotEmpty()
  area: string;

  @ApiProperty({ example: 'Near Charminar', description: 'Landmark of the Company' })
  @IsNotEmpty()
  landmark: string;

  @ApiProperty({ example: 'Hyderabad', description: 'City of the Company' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Telangana', description: 'State of the Company' })
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '500089', description: 'Pincode of the Company' })
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ example: 'Philips', description: 'First Name of the Company Owner' })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Philips', description: 'Last Name of the Company Owner' })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: '9846859647', description: 'Phone Number of the Company Owner' })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: 'email@philips.com', description: 'Email of the Company Owner' })
  @IsNotEmpty()
  admin_email: string;

  @ApiProperty({ example: 'Male', description: 'Gender of the Company Owner' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ example: '18/11/1956', description: 'Date of Birth of the Company Owner' })
  @IsNotEmpty()
  dob: string;

}
