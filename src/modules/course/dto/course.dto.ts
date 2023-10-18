import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CourseDto {
  @ApiProperty({ example: 'Full Stack', description: 'Title of the Course' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'SU1', description: 'Id of the Subject' })
  @IsNotEmpty()
  subject_id: string;

  @ApiProperty({ example: 'EN1', description: 'Id of the Entity' })
  @IsNotEmpty()
  entity_id: string;

  @ApiProperty({ example: 'E1', description: 'Id of the Instructor' })
  @IsNotEmpty()
  instructor: string;

}
