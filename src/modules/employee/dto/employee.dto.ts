import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Gender } from 'src/enums/gender.enum';
import { EmployeeQualification } from 'src/enums/employee-qualification.enum';

export class EmployeeDto {

    @ApiProperty({ example: 'John', description: 'First Name of the Employee' })
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Jacobs', description: 'Last Name of the Employee' })
    last_name: string;

    @ApiProperty({ example: 'E1', description: 'Entity Id of the Employee' })
    @IsNotEmpty()
    entity_id: string;

    @ApiProperty({ example: 'EMP1234', description: 'Employee Code of the Employee' })
    employee_code: string;

    @ApiProperty({ example: '8962623232', description: 'Phone number of the Employee' })
    phone_number: string;

    @ApiProperty({ example: 'employee1@gmail.com', description: 'Email id of the Employee' })
    email: string;

    @ApiProperty({ example: 'CR1', description: 'Role of the Employee in the Company' })
    @IsNotEmpty()
    role_id: string;

    @ApiProperty({ example: 'Graduation', description: 'Qualification of the Employee' })
    @IsEnum(EmployeeQualification)
    qualification: EmployeeQualification;

    @ApiProperty({ example: 'Male', description: 'Gender of the Employee' })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ example: '18/01/1993', description: 'Date of Birth of the Employee' })
    date_of_birth: string;

    @ApiProperty({ example: 'CR1', description: 'Date of joining of the Employee' })
    date_of_joining: string;

}
