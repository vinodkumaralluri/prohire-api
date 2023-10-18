import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { SolutionsController } from './solutions/solutions.controller';
import { SolutionsService } from './solutions/solutions.service';

@Module({
  controllers: [AssignmentsController, SolutionsController],
  providers: [AssignmentsService, SolutionsService]
})
export class AssignmentsModule {}
