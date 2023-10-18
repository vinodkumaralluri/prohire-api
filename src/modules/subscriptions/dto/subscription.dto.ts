import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SubscriptionDto {
  @ApiProperty({ example: 'E1', description: 'Id of the Entity' })
  @IsNotEmpty()
  entity_id: string;

  @ApiProperty({ example: 'ST1', description: 'Id of the Student' })
  @IsNotEmpty()
  student_id: string;

}
