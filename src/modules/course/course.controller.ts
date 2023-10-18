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
import { EntityType } from 'src/enums/entity-type.enum';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CourseDto } from './dto/course.dto';
import { CourseService } from './course.service';

@Controller({
    path: 'course',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Course')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class CourseController {
    constructor(private readonly courseservice: CourseService) { }

    // Add Course
    @Post('/addCourse')
    @ApiOperation({ summary: 'Add Course' })
    @ApiOkResponse({
        description: 'Course added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addCourse(@Body() courseDto: CourseDto, @Request() req) {
        const course = await this.courseservice.addCourse(
            courseDto,
            req.user.user_id,
        );
        if (course.status == true) {
            return { status: true, message: 'Course added successfully' };
        } else {
            throw new NotImplementedException(course.data);
        }
    }

    // Update Course
    @Put('/editCourse/:course_id')
    @ApiOperation({ summary: 'Update Course' })
    @ApiOkResponse({
        description: 'Course updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateCourse(
        @Request() req,
        @Param('course_id') course_id: string,
        @Body() courseDto: CourseDto,
    ) {
        await this.courseservice.updateCourse(
            course_id,
            courseDto,
            req.user.user_id,
        );
        return { status: true, message: 'Course updated successfully', data: true };
    }

    // GET All Courses list
    @Get('/getCourses/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Courses' })
    @ApiOkResponse({
        description: 'Courses fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getCourses(
        @Param('id') id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const courses = await this.courseservice.getCourses(
            id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Courses fetched successfully', data: courses };
    }

    // GET Course by Id
    @Get('/getCourseById/:course_id')
    @ApiOperation({ summary: 'Get Course By Id' })
    @ApiOkResponse({
        description: 'Course fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getCourseById(
        @Param('course_id') course_id: string,
    ) {
        const course = await this.courseservice.getCourseById(
            course_id,
        );
        return { status: true, message: 'Course fetched successfully', data: course };
    }

    // Delete Course
    @Delete('/deleteCourse/:course_id')
    @ApiOperation({ summary: 'Delete Course' })
    @ApiOkResponse({
        description: 'Course deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteCourse(@Param('course_id') course_id: string) {
        await this.courseservice.deleteCourse(
            course_id,
        );
        return { message: 'Course deleted successfully', data: true };
    }

    // Restore Course
    @Delete('/restoreCourse/:course_id')
    @ApiOperation({ summary: 'Restore Course' })
    @ApiOkResponse({
        description: 'Course restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreCourse(
        @Param('course_id') course_id: string,
    ) {
        await this.courseservice.restoreCourse(
            course_id,
        );
        return { message: 'Course restored successfully', data: true };
    }

}
