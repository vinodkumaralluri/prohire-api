import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SubjectDto {
  @ApiProperty({ example: 'Programming', description: 'Name of the Subject' })
  @IsNotEmpty()
  name: string;

}
