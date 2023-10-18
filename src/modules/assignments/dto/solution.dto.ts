import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SolutionDto {
  @ApiProperty({ example: 'AS1', description: 'Id of the Assignment' })
  @IsNotEmpty()
  assignment_id: string;

  @ApiProperty({ example: 'ST1', description: 'Id of the Student' })
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({ example: 'Solution of Sum of 2 numbers', description: 'Solution given by a student to an Assignment' })
  @IsNotEmpty()
  solution: string;

}
