import {
    Body,
    Controller,
    Param,
    Post,
    Put,
    Delete,
    UseGuards,
    UseInterceptors,
    Request,
    Get,
    Query,
    NotImplementedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentDto } from './dto/student.dto';
import { StudentsService } from './students.service';

@Controller({
    path: 'students',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Students')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class StudentsController {
    constructor(private readonly studentservice: StudentsService) { }

    // Add Student
    @Post('/addStudent')
    @ApiOperation({ summary: 'Add Student' })
    @ApiOkResponse({
        description: 'Student added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addStudent(@Body() studentDto: StudentDto, @Request() req) {
        const student = await this.studentservice.addStudent(
            studentDto,
            req.user.user_id,
        );
        if (student.status == true) {
            return { status: true, message: 'Student added successfully' };
        } else {
            throw new NotImplementedException(student.data);
        }
    }

    // Update Student
    @Put('/editStudent/:student_id')
    @ApiOperation({ summary: 'Update Student' })
    @ApiOkResponse({
        description: 'Student updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateStudent(
        @Request() req,
        @Param('student_id') student_id: string,
        @Body() studentDto: StudentDto,
    ) {
        await this.studentservice.updateStudent(
            student_id,
            studentDto,
            req.user.user_id,
        );
        return { status: true, message: 'Student updated successfully', data: true };
    }

    // GET All Students of an Entity
    @Get('/getStudents/:entity_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Students of an Entity' })
    @ApiOkResponse({
        description: 'Students of an Entity fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getStudents(
        @Param('entity_id') entity_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const students = await this.studentservice.getStudents(
            entity_id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Students fetched successfully', data: students };
    }

    // GET Student by Id
    @Get('/getStudentById/:student_id')
    @ApiOperation({ summary: 'Get Student By Id' })
    @ApiOkResponse({
        description: 'Student fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getStudentById(
        @Param('student_id') student_id: string,
    ) {
        const student = await this.studentservice.getStudentById(
            student_id,
        );
        return { status: true, message: 'Student fetched successfully', data: student };
    }

    // Delete Student
    @Delete('/deleteStudent/:student_id')
    @ApiOperation({ summary: 'Delete Student' })
    @ApiOkResponse({
        description: 'Student deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteStudent(@Param('student_id') student_id: string) {
        await this.studentservice.deleteStudent(
            student_id,
        );
        return { message: 'Student deleted successfully', data: true };
    }

    // Restore Student
    @Delete('/restoreStudent/:student_id')
    @ApiOperation({ summary: 'Restore Student' })
    @ApiOkResponse({
        description: 'Student restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreStudent(
        @Param('student_id') student_id: string,
    ) {
        await this.studentservice.restoreStudent(
            student_id,
        );
        return { message: 'Student restored successfully', data: true };
    }

}



