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
import { Course, CourseDocument } from './schemas/course.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { CourseDto } from './dto/course.dto';

@Injectable()
export class CourseService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Course
    async queryCourse(filter: any) {
        const course = await this.courseModel.findOne(filter).exec();
        return course;
    }

    // Add Course
    async addCourse(courseDto: CourseDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Course Title
        const coursecheck = await this.courseModel
            .findOne({ title: courseDto.title, status: 1 })
            .exec();
        if (coursecheck) {
            throw new BadRequestException('Course already exists');
        }
        // Create Course Id
        const course_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.COURSE,
            transactionSession,
        );

        const course = new Course();
        course.course_id = course_id;
        course.title = courseDto.title;
        course.subject_id = courseDto.subject_id;
        course.entity_id = courseDto.entity_id;
        course.instructor = courseDto.instructor;
        course.created_at = AppUtils.getIsoUtcMoment();
        course.updated_at = AppUtils.getIsoUtcMoment();
        course.created_by = loggedInUser;
        course.updated_by = loggedInUser;

        try {
            await this.courseModel.create([course], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Courses list
    async getCourses(
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
            params.title = { $regex: search };
        }
        const count = await this.courseModel.count(params).exec();
        const list = await this.courseModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Course by Id
    async getCourseById(id: string) {
        const course = await this.courseModel
            .findOne({ course_id: id })
            .exec();
        return course;
    }

    // Update Course by Id
    async updateCourse(
        course_id: string,
        courseDto: CourseDto,
        loggedInUser: string,
    ) {
        const course = await this.courseModel.findOne({ course_id }).exec();
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        course.title = courseDto.title;
        course.subject_id = courseDto.subject_id;
        course.entity_id = courseDto.entity_id;
        course.instructor = courseDto.instructor;
        course.updated_at = AppUtils.getIsoUtcMoment();
        course.updated_by = loggedInUser;
        try {
            await this.courseModel.updateOne([{ course_id }, course], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Course by Id
    async deleteCourse(course_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const course = await this.courseModel.findOne({ course_id }).exec();
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        try {
            await this.courseModel.updateOne([{ course_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Course by Id
    async restoreCourse(course_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const course = await this.courseModel.findOne({ course_id }).exec();
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        try {
            await this.courseModel.updateOne([{ course_id }, { status: 1 }], { transactionSession });
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

