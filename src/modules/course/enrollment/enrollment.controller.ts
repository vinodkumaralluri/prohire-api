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
import { EnrollmentStatus } from 'src/enums/enrollment-status.enum';
import { TransformInterceptor } from '../../../core/transform.interceptor';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EnrollmentDto } from '../dto/enrollment.dto';
import { EnrollmentService } from './enrollment.service';

@Controller({
    path: 'enrollment',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Enrollment')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class EnrollmentController {
    constructor(private readonly enrollmentservice: EnrollmentService) { }

    // Add Enrollment
    @Post('/addEnrollment')
    @ApiOperation({ summary: 'Add Enrollment' })
    @ApiOkResponse({
        description: 'Subscription added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addEnrollment(@Body() enrollmentDto: EnrollmentDto, @Request() req) {
        const enrollment = await this.enrollmentservice.addEnrollment(
            enrollmentDto,
            req.user.user_id,
        );
        if (enrollment.status == true) {
            return { status: true, message: 'Enrollment added successfully' };
        } else {
            throw new NotImplementedException(enrollment.data);
        }
    }

    // Update Enrollment
    @Put('/updateEnrollment/:enrollment_status/:enrollment_id')
    @ApiOperation({ summary: 'Update Enrollment' })
    @ApiOkResponse({
        description: 'Enrollment updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateEnrollment(
        @Request() req,
        @Param('enrollment_status') enrollment_status: EnrollmentStatus,
        @Param('enrollment_id') enrollment_id: string,
    ) {
        await this.enrollmentservice.updateEnrollment(
            enrollment_status,
            enrollment_id,
            req.user.user_id,
        );
        return { status: true, message: 'Enrollment updated successfully', data: true };
    }

    // GET All Enrollments list
    @Get('/getEnrollments/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Subscriptions' })
    @ApiOkResponse({
        description: 'Subscriptions fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getEnrollments(
        @Param('id') id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const enrollments = await this.enrollmentservice.getEnrollments(
            id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Enrollments fetched successfully', data: enrollments };
    }

    // GET Enrollment by Id
    @Get('/getEnrollmentById/:enrollment_id')
    @ApiOperation({ summary: 'Get Subscription By Id' })
    @ApiOkResponse({
        description: 'Subscription fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getEnrollmentById(
        @Param('enrollment_id') enrollment_id: string,
    ) {
        const enrollment = await this.enrollmentservice.getEnrollmentById(
            enrollment_id,
        );
        return { status: true, message: 'Enrollment fetched successfully', data: enrollment };
    }

    // Delete Enrollment
    @Delete('/deleteEnrollment/:enrollment_id')
    @ApiOperation({ summary: 'Delete Enrollment' })
    @ApiOkResponse({
        description: 'Enrollment deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteEnrollment(@Param('enrollment_id') enrollment_id: string) {
        await this.enrollmentservice.deleteEnrollment(
            enrollment_id,
        );
        return { message: 'Enrollment deleted successfully', data: true };
    }

    // Restore Enrollment
    @Delete('/restoreEnrollment/:enrollment_id')
    @ApiOperation({ summary: 'Restore Enrollment' })
    @ApiOkResponse({
        description: 'Enrollment restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreEnrollment(
        @Param('enrollment_id') enrollment_id: string,
    ) {
        await this.enrollmentservice.restoreEnrollment(
            enrollment_id,
        );
        return { message: 'Enrollment restored successfully', data: true };
    }

}



