import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalExceptionFilter } from './core/global-exception.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './modules/company/company.module';
import { CollegeModule } from './modules/college/college.module';
import { StudentsModule } from './modules/students/students.module';
import { UsersModule } from './modules/users/users.module';
import { CourseModule } from './modules/course/course.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AutoIncrementModule } from './modules/auto-increment/auto-increment.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { RoleModule } from './modules/role/role.module';
import { EntityModule } from './modules/entity/entity.module';
import { SubjectModule } from './modules/subject/subject.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AutoIncrementModule,
    CompanyModule, 
    CollegeModule, 
    StudentsModule, 
    UsersModule, 
    CourseModule, 
    AssignmentsModule, 
    AnnouncementsModule, 
    EmployeeModule, RoleModule, EntityModule, SubjectModule, SubscriptionsModule, 
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    AppService,
  ],
})
export class AppModule {}
