import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class RoleDto {
  @ApiProperty({ example: 'C1', description: 'Company Id' })
  @IsNotEmpty()
  entity_id: string;

  @ApiProperty({ example: 'admin', description: 'Role in the Company' })
  @IsNotEmpty()
  role: string;

}
