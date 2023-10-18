import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { EnrollmentController } from './enrollment/enrollment.controller';
import { EnrollmentService } from './enrollment/enrollment.service';

@Module({
  controllers: [CourseController, EnrollmentController],
  providers: [CourseService, EnrollmentService]
})
export class CourseModule {}
