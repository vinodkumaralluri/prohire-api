import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { AppUtils } from '../../utils/app.utils';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { AnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Announcement
    async queryAnnouncement(filter: any) {
        const announcement = await this.announcementModel.findOne(filter).exec();
        return announcement;
    }

    // Add Announcement
    async addAnnouncement(announcementDto: AnnouncementDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const announcement = await this.createAnnouncement(announcementDto, loggedInUser, transactionSession);

        if (announcement.status === true) {
            await transactionSession.commitTransaction();
            await transactionSession.endSession();
            return { status: true, data: 'success' };
        } else {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
            return { status: false, data: 'Failed' };
        }

    }

    async createAnnouncement(announcementData: any, loggedInUser: string, session: mongoose.ClientSession | null = null) {

        // Create Announcement Id
        const announcement_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ANNOUNCEMENT,
            session,
        );

        const announcement = new Announcement();
        announcement.announcement_id = announcement_id;
        announcement.entity_id = announcementData.entity_id;
        announcement.subject = announcementData.subject;
        announcement.announcement = announcementData.announcement;
        announcement.created_at = AppUtils.getIsoUtcMoment();
        announcement.updated_at = AppUtils.getIsoUtcMoment();
        announcement.created_by = loggedInUser;
        announcement.updated_by = loggedInUser;

        try {
            await this.announcementModel.create([announcement], { session });
            return { status: true, data: 'success' };
        } catch (e) {
            return { status: false, data: e };
        }
    }

    // GET All Announcements list
    async getAnnouncements(
        entity_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { entity_id: entity_id, status: 1 }
        if (search) {
            params.subject = { $regex: search };
        }
        const count = await this.announcementModel.count(params).exec();
        const list = await this.announcementModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Announcement by Id
    async getAnnouncementById(id: string) {
        const announcement = await this.announcementModel
            .findOne({ announcement_id: id})
            .exec();
        return announcement;
    }

    // Update Announcement by Id
    async updateAnnouncement(
        announcement_id: string,
        announcementDto: AnnouncementDto,
        loggedInUser: string,
    ) {
        const announcement = await this.announcementModel.findOne({ announcement_id }).exec();
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        announcement.announcement = announcementDto.announcement;
        announcement.updated_at = AppUtils.getIsoUtcMoment();
        announcement.updated_by = loggedInUser;
        try {
            await this.announcementModel.updateOne([{ announcement_id }, announcement], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Announcement by Id
    async deleteAnnouncement(announcement_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const announcement = await this.announcementModel.findOne({ announcement_id }).exec();
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }
        try {
            await this.announcementModel.updateOne([{ announcement_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Announcement by Id
    async restoreAnnouncement(announcement_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const announcement = await this.announcementModel.findOne({ announcement_id }).exec();
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }
        try {
            await this.announcementModel.updateOne([{ announcement_id }, { status: 1 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

}



