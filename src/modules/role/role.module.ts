import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from './schemas/permission.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService]
})
export class RoleModule {}
