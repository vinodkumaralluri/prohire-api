import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class AssignmentDto {
  @ApiProperty({ example: 'SU1', description: 'Id of the Subject' })
  @IsNotEmpty()
  subject_id: string;

  @ApiProperty({ example: 'E1', description: 'Id of the Entity' })
  @IsNotEmpty()
  entity_id: string;

  @ApiProperty({ example: 'Sum of 2 numbers', description: 'Problem Statement of the Assignment' })
  @IsNotEmpty()
  problemStatement: string;

  @ApiProperty({ example: 'Code of the problem statement', description: 'Solution of the Problem Statement' })
  @IsNotEmpty()
  solution: string;

}
