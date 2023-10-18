import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AnnouncementSubject } from 'src/enums/announcement-subject.enum';

export class AnnouncementDto {
  @ApiProperty({ example: 'E1', description: 'Id of the Entity' })
  @IsNotEmpty()
  entity_id: string;

  @ApiProperty({ example: 'Course', description: 'Subject of the Announcement' })
  @IsEnum(AnnouncementSubject)
  @IsNotEmpty()
  subject: AnnouncementSubject;

  @ApiProperty({ example: 'New Course is arrived', description: 'Description of the Announcement' })
  @IsNotEmpty()
  announcement: string;

}
