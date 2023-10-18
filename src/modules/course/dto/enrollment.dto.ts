import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EnrollmentDto {
  @ApiProperty({ example: 'ST1', description: 'Id of the Student' })
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({ example: 'CO1', description: 'Id of the Course' })
  @IsNotEmpty()
  course_id: string;

}
