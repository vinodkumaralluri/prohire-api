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
import { Subject, SubjectDocument } from './schemas/subject.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { SubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Subject
    async querySubject(filter: any) {
        const subject = await this.subjectModel.findOne(filter).exec();
        return subject;
    }

    // Add Subject
    async addSubject(subjectDto: SubjectDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Subject Name
        const subjectcheck = await this.subjectModel
            .findOne({ name: subjectDto.name, status: 1 })
            .exec();
        if (subjectcheck) {
            throw new BadRequestException('Subject already exists');
        }
        // Create Subject Id
        const subject_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.SUBJECT,
            transactionSession,
        );

        const subject = new Subject();
        subject.subject_id = subject_id;
        subject.name = subjectDto.name;
        subject.created_at = AppUtils.getIsoUtcMoment();
        subject.updated_at = AppUtils.getIsoUtcMoment();
        subject.created_by = loggedInUser;
        subject.updated_by = loggedInUser;

        try {
            await this.subjectModel.create([subject], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Subjects list
    async getSubjects(
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { status: 1 };
        if (search) {
            params.name = { $regex: search };
        }
        const count = await this.subjectModel.count(params).exec();
        const list = await this.subjectModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Subject by Id
    async getSubjectById(id: string) {
        const subject = await this.subjectModel
            .findOne({ subject_id: id })
            .exec();
        return subject;
    }

    // Update Subject by Id
    async updateSubject(
        subject_id: string,
        subjectDto: SubjectDto,
        loggedInUser: string,
    ) {
        const subject = await this.subjectModel.findOne({ subject_id }).exec();
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        subject.name = subjectDto.name;
        subject.updated_at = AppUtils.getIsoUtcMoment();
        subject.updated_by = loggedInUser;
        try {
            await this.subjectModel.updateOne([{ subject_id }, subject], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Subject by Id
    async deleteSubject(subject_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const subject = await this.subjectModel.findOne({ subject_id }).exec();
        if (!subject) {
            throw new NotFoundException('Subjects not found');
        }
        try {
            await this.subjectModel.updateOne([{ subject_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Subject by Id
    async restoreSubject(subject_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const subject = await this.subjectModel.findOne({ subject_id }).exec();
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }
        try {
            await this.subjectModel.updateOne([{ subject_id }, { status: 0 }], { transactionSession });
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


