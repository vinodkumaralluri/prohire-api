import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/enums/gender.enum';
import { AcademicCourse, AcademicDegree, AcademicYear } from 'src/enums/academics.enum';

export class StudentDto {

    @ApiProperty({ example: 'John', description: 'First Name of the Student' })
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Jacobs', description: 'Last Name of the Student' })
    last_name: string;

    @ApiProperty({ example: 'E1', description: 'Entity Id of the Student' })
    @IsNotEmpty()
    entity_id: string;

    @ApiProperty({ example: 'ROLE1234', description: 'Roll No of the Student' })
    roll_no: string;

    @ApiProperty({ example: '8962623232', description: 'Phone number of the Student' })
    phone_number: string;

    @ApiProperty({ example: 'employee1@gmail.com', description: 'Email id of the Student' })
    email: string;

    @ApiProperty({ example: 'CR1', description: 'Role of the Student in the College' })
    @IsNotEmpty()
    role_id: string;

    @ApiProperty({ example: 'Male', description: 'Gender of the Student' })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ example: 'Engineering', description: 'Academic Course of the Student' })
    @IsEnum(AcademicCourse)
    academic_course: AcademicCourse;

    @ApiProperty({ example: 'bachelors', description: 'Academic Degree of the Student' })
    @IsEnum(AcademicDegree)
    degree: AcademicDegree;

    @ApiProperty({ example: 'thirdyear', description: 'Academic Year of the Student' })
    @IsEnum(AcademicYear)
    academic_year: AcademicYear;

}
