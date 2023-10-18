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
import { AssignmentDto } from './dto/assignment.dto';
import { AssignmentsService } from './assignments.service';

@Controller({
    path: 'assignments',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Assignments')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class AssignmentsController {
    constructor(private readonly assignmentservice: AssignmentsService) { }

    // Add Assignment
    @Post('/addAssignment')
    @ApiOperation({ summary: 'Add Assignment' })
    @ApiOkResponse({
        description: 'Assignment added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addAssignment(@Body() assignmentDto: AssignmentDto, @Request() req) {
        const assignment = await this.assignmentservice.addAssignment(
            assignmentDto,
            req.user.user_id,
        );
        if (assignment.status == true) {
            return { status: true, message: 'Assignment added successfully' };
        } else {
            throw new NotImplementedException(assignment.data);
        }
    }

    // Update Assignment
    @Put('/editAssignment/:assignment_id')
    @ApiOperation({ summary: 'Update Assignment' })
    @ApiOkResponse({
        description: 'Assignment updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateAssignment(
        @Request() req,
        @Param('assignment_id') assignment_id: string,
        @Body() assignmentDto: AssignmentDto,
    ) {
        await this.assignmentservice.updateAssignment(
            assignment_id,
            assignmentDto,
            req.user.user_id,
        );
        return { status: true, message: 'Assignment updated successfully', data: true };
    }

    // GET All Assignments list
    @Get('/getAssignments/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Assignment' })
    @ApiOkResponse({
        description: 'Assignment fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAssignments(
        @Param('id') id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const assignments = await this.assignmentservice.getAssignments(
            id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Assignments fetched successfully', data: assignments };
    }

    // GET Assignment by Id
    @Get('/getAssignmentById/:assignment_id')
    @ApiOperation({ summary: 'Get Assignment By Id' })
    @ApiOkResponse({
        description: 'Assignment fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAssignmentById(
        @Param('assignment_id') assignment_id: string,
    ) {
        const assignment = await this.assignmentservice.getAssignmentById(
            assignment_id,
        );
        return { status: true, message: 'Assignment fetched successfully', data: assignment };
    }

    // Delete Assignment
    @Delete('/deleteAssignment/:assignment_id')
    @ApiOperation({ summary: 'Delete Assignment' })
    @ApiOkResponse({
        description: 'Assignment deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteAssignment(@Param('assignment_id') assignment_id: string) {
        await this.assignmentservice.deleteAssignment(
            assignment_id,
        );
        return { message: 'Assignment deleted successfully', data: true };
    }

    // Restore Assignment
    @Delete('/restoreAssignment/:assignment_id')
    @ApiOperation({ summary: 'Restore Assignment' })
    @ApiOkResponse({
        description: 'Assignment restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreAssignment(
        @Param('assignment_id') assignment_id: string,
    ) {
        await this.assignmentservice.restoreAssignment(
            assignment_id,
        );
        return { message: 'Assignment restored successfully', data: true };
    }

}

