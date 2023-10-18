import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ModuleType } from '../../../enums/module-type.enum';
import { PermissionType } from '../../../enums/permission.enum';

export class PermissionDto {
  @ApiProperty({ example: 'RO1', description: 'Company Role Id' })
  @IsNotEmpty()
  role_id: string;

  @ApiProperty({ example: 'Company', description: 'Module' })
  @IsEnum(ModuleType)
  @IsNotEmpty()
  module: ModuleType;

  @ApiProperty({ example: 'view', description: 'Permission of the Module' })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  permission: PermissionType;

}
