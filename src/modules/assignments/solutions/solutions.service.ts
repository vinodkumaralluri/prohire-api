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
import { Solution, SolutionDocument } from '../schemas/solution.schema';
import { AutoIncrementService } from '../../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../../auto-increment/auto-increment.enum';
import { SolutionDto } from '../dto/solution.dto';
import { SolutionStatus } from 'src/enums/solution-status.enum';

@Injectable()
export class SolutionsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Solution.name) private solutionModel: Model<SolutionDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Solution
    async querySolution(filter: any) {
        const solution = await this.solutionModel.findOne(filter).exec();
        return solution;
    }

    // Add Solution to an Assignment
    async addSolution(solutionDto: SolutionDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Solution
        const solutioncheck = await this.solutionModel
            .findOne({ student_id: solutionDto.student_id, assignment_id: solutionDto.assignment_id, status: 1 })
            .exec();
        if (solutioncheck) {
            throw new BadRequestException('Solution already exists');
        }
        // Create Solution Id
        const solution_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.SOLUTION,
            transactionSession,
        );

        const solution = new Solution();
        solution.solution_id = solution_id;
        solution.assignment_id = solutionDto.assignment_id;
        solution.student_id = solutionDto.student_id;
        solution.solution = solutionDto.solution;
        solution.created_at = AppUtils.getIsoUtcMoment();
        solution.updated_at = AppUtils.getIsoUtcMoment();
        solution.created_by = loggedInUser;
        solution.updated_by = loggedInUser;

        try {
            await this.solutionModel.create([solution], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Solutions list
    async getSolutions(
        id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = {
            $or: [
                { assignment_id: id },
            ],
        }
        if (search) {
            params.solution = { $regex: search };
        }
        const count = await this.solutionModel.count(params).exec();
        const list = await this.solutionModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Solution by Id
    async getSolutionById(id: string) {
        const solution = await this.solutionModel
            .findOne({ solution_id: id })
            .exec();
        return solution;
    }

    // Update Solution by Id
    async updateSolution(
        solution_id: string,
        solutionDto: SolutionDto,
        loggedInUser: string,
    ) {
        const solution = await this.solutionModel.findOne({ solution_id }).exec();
        if (!solution) {
            throw new NotFoundException('Solution not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        solution.solution = solutionDto.solution;
        solution.updated_at = AppUtils.getIsoUtcMoment();
        solution.updated_by = loggedInUser;
        try {
            await this.solutionModel.updateOne([{ solution_id }, solution], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Update Solution Status by Id
    async updateSolutionStatus(
        solution_status: SolutionStatus,
        solution_id: string,
        loggedInUser: string,
    ) {
        const solution = await this.solutionModel.findOne({ solution_id }).exec();
        if (!solution) {
            throw new NotFoundException('Solution not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        solution.solutionStatus = solution_status;
        solution.updated_at = AppUtils.getIsoUtcMoment();
        solution.updated_by = loggedInUser;
        try {
            await this.solutionModel.updateOne([{ solution_id }, solution], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Solution by Id
    async deleteSolution(solution_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const solution = await this.solutionModel.findOne({ solution_id }).exec();
        if (!solution) {
            throw new NotFoundException('Solution not found');
        }
        try {
            await this.solutionModel.updateOne([{ solution_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Solution by Id
    async restoreSolution(solution_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const solution = await this.solutionModel.findOne({ solution_id }).exec();
        if (!solution) {
            throw new NotFoundException('Solution not found');
        }
        try {
            await this.solutionModel.updateOne([{ solution_id }, { status: 1 }], { transactionSession });
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


