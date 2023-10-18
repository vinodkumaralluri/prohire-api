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
import { SubjectDto } from './dto/subject.dto';
import { SubjectService } from './subject.service';

@Controller({
    path: 'subject',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Subject')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class SubjectController {
    constructor(private readonly subjectservice: SubjectService) { }

    // Add Subject
    @Post('/addSubject')
    @ApiOperation({ summary: 'Add Subject' })
    @ApiOkResponse({
        description: 'Subject added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addSubject(@Body() subjectDto: SubjectDto, @Request() req) {
        const subject = await this.subjectservice.addSubject(
            subjectDto,
            req.user.user_id,
        );
        if (subject.status == true) {
            return { status: true, message: 'Subject added successfully' };
        } else {
            throw new NotImplementedException(subject.data);
        }
    }

    // Update Subject
    @Put('/editSubject/:subject_id')
    @ApiOperation({ summary: 'Update Subject' })
    @ApiOkResponse({
        description: 'Subject updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateSubject(
        @Request() req,
        @Param('subject_id') subject_id: string,
        @Body() subjectDto: SubjectDto,
    ) {
        await this.subjectservice.updateSubject(
            subject_id,
            subjectDto,
            req.user.user_id,
        );
        return { status: true, message: 'Subject updated successfully', data: true };
    }

    // GET All Subjects list
    @Get('/getSubjects')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Subjects' })
    @ApiOkResponse({
        description: 'Subjects fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getSubjects(
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const subjects = await this.subjectservice.getSubjects(
            page,
            limit,
            search,
        );
        return { status: true, message: 'Subjects fetched successfully', data: subjects };
    }

    // GET Subject by Id
    @Get('/getSubjectById/:subject_id')
    @ApiOperation({ summary: 'Get Subject By Id' })
    @ApiOkResponse({
        description: 'Subject fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getSubjectById(
        @Param('subject_id') subject_id: string,
    ) {
        const subject = await this.subjectservice.getSubjectById(
            subject_id,
        );
        return { status: true, message: 'Subject fetched successfully', data: subject };
    }

    // Delete Subject
    @Delete('/deleteSubject/:subject_id')
    @ApiOperation({ summary: 'Delete Subject' })
    @ApiOkResponse({
        description: 'Subject deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteSubject(@Param('subject_id') subject_id: string) {
        await this.subjectservice.deleteSubject(
            subject_id,
        );
        return { message: 'Subject deleted successfully', data: true };
    }

    // Restore Subject
    @Delete('/restoreSubject/:subject_id')
    @ApiOperation({ summary: 'Restore Subject' })
    @ApiOkResponse({
        description: 'Subject restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreSubject(
        @Param('subject_id') subject_id: string,
    ) {
        await this.subjectservice.restoreSubject(
            subject_id,
        );
        return { message: 'Subject restored successfully', data: true };
    }

}
