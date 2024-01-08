import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ModuleType } from '../../../enums/module-type.enum';
import { PermissionType } from '../../../enums/permission.enum';

export class PermissionDto {

  @ApiProperty({ example: 'Tasks', description: 'Module' })
  @IsEnum(ModuleType)
  @IsNotEmpty()
  module: ModuleType;

  @ApiProperty({ example: 'view', description: 'Permissions of the Module' })
  @IsEnum(PermissionType)
  @IsNotEmpty()
  permissions: any[];

}
