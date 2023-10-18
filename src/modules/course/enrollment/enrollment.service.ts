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
import { AppUtils } from '../../../utils/app.utils';
import { Enrollment, EnrollmentDocument } from '../schemas/enrollment.schema';
import { AutoIncrementService } from '../../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../../auto-increment/auto-increment.enum';
import { EnrollmentDto } from '../dto/enrollment.dto';
import { EnrollmentStatus } from 'src/enums/enrollment-status.enum';

@Injectable()
export class EnrollmentService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Enrollment
    async queryEnrollment(filter: any) {
        const enrollment = await this.enrollmentModel.findOne(filter).exec();
        return enrollment;
    }

    // Add Enrollment
    async addEnrollment(enrollmentDto: EnrollmentDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const enrollment = await this.createEnrollment(enrollmentDto, loggedInUser, transactionSession);

        if (enrollment.status === true) {
            await transactionSession.commitTransaction();
            await transactionSession.endSession();
            return { status: true, data: 'success' };
        } else {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
            return { status: false, data: 'Failed' };
        }

    }

    async createEnrollment(enrollmentData: any, loggedInUser: string, session: mongoose.ClientSession | null = null) {

        // Create Enrollment Id
        const enrollment_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ENROLLMENT,
            session,
        );

        const enrollment = new Enrollment();
        enrollment.enrollment_id = enrollment_id;
        enrollment.student_id = enrollmentData.student_id;
        enrollment.course_id = enrollmentData.course_id;
        enrollment.created_at = AppUtils.getIsoUtcMoment();
        enrollment.updated_at = AppUtils.getIsoUtcMoment();
        enrollment.created_by = loggedInUser;
        enrollment.updated_by = loggedInUser;

        try {
            await this.enrollmentModel.create([enrollment], { session });
            return { status: true, data: 'success' };
        } catch (e) {
            return { status: false, data: e };
        }
    }

    // GET All Enrollments list
    async getEnrollments(
        id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = {
            $or: [
                { course_id: id },
                { student_id: id },
            ],
            status: 1
        }
        const count = await this.enrollmentModel.count(params).exec();
        const list = await this.enrollmentModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Enrollment by Id
    async getEnrollmentById(id: string) {
        const enrollment = await this.enrollmentModel
            .findOne({ enrollment_id: id})
            .exec();
        return enrollment;
    }

    // Update Enrollment by Id
    async updateEnrollment(
        enrollment_status: EnrollmentStatus,
        enrollment_id: string,
        loggedInUser: string,
    ) {
        const enrollment = await this.enrollmentModel.findOne({ enrollment_id }).exec();
        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        enrollment.enrollment_status = enrollment_status;
        enrollment.updated_at = AppUtils.getIsoUtcMoment();
        enrollment.updated_by = loggedInUser;
        try {
            await this.enrollmentModel.updateOne([{ enrollment_id }, enrollment], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Enrollment by Id
    async deleteEnrollment(enrollment_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const enrollment = await this.enrollmentModel.findOne({ enrollment_id }).exec();
        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }
        try {
            await this.enrollmentModel.updateOne([{ enrollment_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Enrollment by Id
    async restoreEnrollment(enrollment_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const enrollment = await this.enrollmentModel.findOne({ enrollment_id }).exec();
        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }
        try {
            await this.enrollmentModel.updateOne([{ enrollment_id }, { status: 1 }], { transactionSession });
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



