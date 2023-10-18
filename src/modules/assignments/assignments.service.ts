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
import { Assignment, AssignmentDocument } from './schemas/assignment.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { AssignmentDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Assignment.name) private assignmentModel: Model<AssignmentDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Assignment
    async queryAssignment(filter: any) {
        const assignment = await this.assignmentModel.findOne(filter).exec();
        return assignment;
    }

    // Add Assignment
    async addAssignment(assignmentDto: AssignmentDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Assignment
        const assignmentcheck = await this.assignmentModel
            .findOne({ problemStatement: assignmentDto.problemStatement, subject_id: assignmentDto.subject_id, entity_id: assignmentDto.entity_id, status: 1 })
            .exec();
        if (assignmentcheck) {
            throw new BadRequestException('Assignment already exists');
        }
        // Create Assignment Id
        const assignment_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ASSIGNMENT,
            transactionSession,
        );

        const assignment = new Assignment();
        assignment.assignment_id = assignment_id;
        assignment.subject_id = assignmentDto.subject_id;
        assignment.entity_id = assignmentDto.entity_id;
        assignment.problemStatement = assignmentDto.problemStatement;
        assignment.solution = assignmentDto.solution;
        assignment.created_at = AppUtils.getIsoUtcMoment();
        assignment.updated_at = AppUtils.getIsoUtcMoment();
        assignment.created_by = loggedInUser;
        assignment.updated_by = loggedInUser;

        try {
            await this.assignmentModel.create([assignment], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Assignments list
    async getAssignments(
        id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = {
            $or: [
                { entity_id: id },
                { subject_id: id },
            ],
            status: 1
        }
        if (search) {
            params.problemStatement = { $regex: search };
        }
        const count = await this.assignmentModel.count(params).exec();
        const list = await this.assignmentModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Assignment by Id
    async getAssignmentById(id: string) {
        const assignment = await this.assignmentModel
            .findOne({ assignment_id: id})
            .exec();
        return assignment;
    }

    // Update Assignment by Id
    async updateAssignment(
        assignment_id: string,
        assignmentDto: AssignmentDto,
        loggedInUser: string,
    ) {
        const assignment = await this.assignmentModel.findOne({ assignment_id }).exec();
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        assignment.subject_id = assignmentDto.subject_id;
        assignment.problemStatement = assignmentDto.problemStatement;
        assignment.solution = assignmentDto.solution;
        assignment.updated_at = AppUtils.getIsoUtcMoment();
        assignment.updated_by = loggedInUser;
        try {
            await this.assignmentModel.updateOne([{ assignment_id }, assignment], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Assignment by Id
    async deleteAssignment(assignment_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const assignment = await this.assignmentModel.findOne({ assignment_id }).exec();
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        try {
            await this.assignmentModel.updateOne([{ assignment_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Assignment by Id
    async restoreAssignment(assignment_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const assignment = await this.assignmentModel.findOne({ assignment_id }).exec();
        if (!assignment) {
            throw new NotFoundException('Assignment not found');
        }
        try {
            await this.assignmentModel.updateOne([{ assignment_id }, { status: 1 }], { transactionSession });
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


