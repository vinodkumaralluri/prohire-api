import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { Permission, PermissionSchema } from '../role/schemas/permission.schema';
import { UsersModule } from '../users/users.module';
import { CompanyModule } from '../company/company.module';
import { RoleModule } from '../role/role.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AutoIncrementModule,
    UsersModule,
    RoleModule,
    forwardRef(() => CompanyModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '86400s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
