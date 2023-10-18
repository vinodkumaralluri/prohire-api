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
import { Student, StudentDocument } from './schemas/student.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { StudentDto } from './dto/student.dto';
import { User } from '../users/schemas/user.schema';
import { UserType } from 'src/enums/user-type.enum';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class StudentsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
        private autoIncrementService: AutoIncrementService,
        private authService: AuthService,
        private roleService: RoleService,
    ) { }

    // Query Student
    async queryStudent(filter: any) {
        const student = await this.studentModel.findOne(filter).exec();
        return student;
    }

    // Add Student
    async addStudent(studentDto: StudentDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const user = {
            first_name: studentDto.first_name,
            last_name: studentDto.last_name,
            phone_number: studentDto.phone_number,
            email: studentDto.email,
            user_type: UserType.Employee,
            password: studentDto.phone_number,
        }
        let usersignup = await this.authService.signUp(user, transactionSession);

        // Check for Student Name
        const studentcheck = await this.studentModel
            .findOne({ first_name: studentDto.first_name, last_name: studentDto.last_name, status: 1 })
            .exec();
        if (studentcheck) {
            throw new BadRequestException('Student already exists');
        }

        if (usersignup.status == true) {
            const student = await this.createStudent(studentDto, usersignup.user_id, loggedInUser, transactionSession);
            if (student.status === true) {
                await transactionSession.commitTransaction();
                await transactionSession.endSession();
                return { status: true, data: 'success' };
            } else {
                await transactionSession.abortTransaction();
                await transactionSession.endSession();
                return { status: false, data: 'Failed' };
            }
        }
    }

    async createStudent(studentData: any, user_id: string, loggedInUser: string, session: mongoose.ClientSession | null = null) {
        // Create Student Id
        const student_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.STUDENT,
            session,
        );

        if (!studentData.role_id) {
            // Get role
            const role = await this.roleService.getRoleByCompany(studentData.entity_id, UserType.Student);
        }

        const student = new Student();
        student.student_id = student_id;
        student.user_id = user_id;
        student.first_name = studentData.first_name;
        student.last_name = studentData.last_name;
        student.entity_id = studentData.entity_id;
        student.roll_no = studentData.roll_no;
        student.role_id = studentData.role_id;
        student.gender = studentData.gender;
        student.degree = studentData.degree;
        student.academic_course = studentData.academic_course;
        student.academic_year = studentData.academic_year;
        student.created_at = AppUtils.getIsoUtcMoment();
        student.updated_at = AppUtils.getIsoUtcMoment();
        student.created_by = loggedInUser;
        student.updated_by = loggedInUser;

        try {
            await this.studentModel.create([student], { session });
            return { status: true, data: 'success' };
        } catch (e) {
            return { status: false, data: e };
        }
    }

    // GET All Students list
    async getStudents(
        loggedInUser: User,
        entity_id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        let params: any;
        if (search) {
            params = {
                $or: [
                    { first_name: { $regex: search } },
                    { last_name: { $regex: search } },
                    { roll_no: { $regex: search } },
                ],
                entity_id: entity_id,
                status: 1,
            };
        } else {
            params = { entity_id: entity_id, status: 1 };
        }
        const count = await this.studentModel.count(params).exec();
        const list = await this.studentModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Student by Id
    async getStudentById(id: string, loggedInUser: User) {
        const student = await this.studentModel
            .findOne({ student_id: id })
            .exec();
        return student;
    }

    // Update Student by Id
    async updateStudent(
        student_id: string,
        studentDto: StudentDto,
        loggedInUser: User,
    ) {
        const student = await this.studentModel.findOne({ student_id }).exec();
        if (!student) {
            throw new NotFoundException('Student not found');
        }
        student.first_name = studentDto.first_name;
        student.last_name = studentDto.last_name;
        student.roll_no = studentDto.roll_no;
        student.gender = studentDto.gender;
        student.degree = studentDto.degree;
        student.academic_course = studentDto.academic_course;
        student.academic_year = studentDto.academic_year;
        student.updated_at = AppUtils.getIsoUtcMoment();
        student.updated_by = loggedInUser.user_id;
        return this.studentModel.updateOne({ student_id }, student);
    }

    // Delete Student by Id
    async deleteStudent(student_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const student = await this.studentModel.findOne({ student_id }).exec();
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        try {
            await this.studentModel.updateOne([{ student_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Student by Id
    async restoreStudent(student_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const student = await this.studentModel.findOne({ student_id }).exec();
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        try {
            await this.studentModel.updateOne([{ student_id }, { status: 1 }], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}
