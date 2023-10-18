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
import { AnnouncementDto } from './dto/announcement.dto';
import { AnnouncementsService } from './announcements.service';

@Controller({
    path: 'announcements',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Announcements')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class AnnouncementsController {
    constructor(private readonly announcementservice: AnnouncementsService) { }

    // Add Announcement
    @Post('/addAnnouncement')
    @ApiOperation({ summary: 'Add Announcement' })
    @ApiOkResponse({
        description: 'Announcement added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addAnnouncement(@Body() announcementDto: AnnouncementDto, @Request() req) {
        const announcement = await this.announcementservice.addAnnouncement(
            announcementDto,
            req.user.user_id,
        );
        if (announcement.status == true) {
            return { status: true, message: 'Announcement added successfully' };
        } else {
            throw new NotImplementedException(announcement.data);
        }
    }

    // Update Announcement
    @Put('/editAnnouncement/:announcement_id')
    @ApiOperation({ summary: 'Update Announcement' })
    @ApiOkResponse({
        description: 'Announcement updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateAnnouncement(
        @Request() req,
        @Param('announcement_id') announcement_id: string,
        @Body() announcementDto: AnnouncementDto,
    ) {
        await this.announcementservice.updateAnnouncement(
            announcement_id,
            announcementDto,
            req.user.user_id,
        );
        return { status: true, message: 'Announcement updated successfully', data: true };
    }

    // GET All Announcements list
    @Get('/getAnnouncements/:entity_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Announcements' })
    @ApiOkResponse({
        description: 'Announcements fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAnnouncements(
        @Param('entity_id') entity_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const announcements = await this.announcementservice.getAnnouncements(
            entity_id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Announcements fetched successfully', data: announcements };
    }

    // GET Announcement by Id
    @Get('/getAnnouncementById/:announcement_id')
    @ApiOperation({ summary: 'Get Announcement By Id' })
    @ApiOkResponse({
        description: 'Announcement fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getAnnouncementById(
        @Param('announcement_id') announcement_id: string,
    ) {
        const announcement = await this.announcementservice.getAnnouncementById(
            announcement_id,
        );
        return { status: true, message: 'Announcement fetched successfully', data: announcement };
    }

    // Delete Announcement
    @Delete('/deleteAnnouncement/:announcement_id')
    @ApiOperation({ summary: 'Delete Announcement' })
    @ApiOkResponse({
        description: 'Announcement deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteAnnouncement(@Param('announcement_id') announcement_id: string) {
        await this.announcementservice.deleteAnnouncement(
            announcement_id,
        );
        return { message: 'Announcement deleted successfully', data: true };
    }

    // Restore Announcement
    @Delete('/restoreAnnouncement/:announcement_id')
    @ApiOperation({ summary: 'Restore Announcement' })
    @ApiOkResponse({
        description: 'Announcement restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreAnnouncement(
        @Param('announcement_id') announcement_id: string,
    ) {
        await this.announcementservice.restoreAnnouncement(
            announcement_id,
        );
        return { message: 'Announcement restored successfully', data: true };
    }

}


