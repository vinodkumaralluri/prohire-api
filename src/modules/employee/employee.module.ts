import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { Store, StoreSchema } from '../store/schemas/store.schema';
import { ServiceCenter, ServiceCenterSchema } from '../service-center/schemas/service-center.schema';
import { AuthModule } from '../auth/auth.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    AutoIncrementModule,
    AuthModule,
    RoleModule,
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Store.name, schema: StoreSchema },
      { name: ServiceCenter.name, schema: ServiceCenterSchema },
    ]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
