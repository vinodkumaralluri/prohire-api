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
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { EmployeeDto } from './dto/employee.dto';
import { User } from '../users/schemas/user.schema';
import { UserType } from 'src/enums/user-type.enum';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        private autoIncrementService: AutoIncrementService,
        private authService: AuthService,
        private roleService: RoleService,
    ) { }

    // Query Employee
    async queryEmployee(filter: any) {
        const employee = await this.employeeModel.findOne(filter).exec();
        return employee;
    }

    // Add Employee
    async addEmployee(employeeDto: EmployeeDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const user = {
            first_name: employeeDto.first_name,
            last_name: employeeDto.last_name,
            phone_number: employeeDto.phone_number,
            email: employeeDto.email,
            user_type: UserType.Employee,
            password: employeeDto.phone_number,
        }
        let usersignup = await this.authService.signUp(user, transactionSession);

        // Check for Employee Name
        const employeecheck = await this.employeeModel
            .findOne({ first_name: employeeDto.first_name, last_name: employeeDto.last_name, status: 1 })
            .exec();
        if (employeecheck) {
            throw new BadRequestException('Employee already exists');
        }

        if (usersignup.status == true) {
            const employee = await this.createEmployee(employeeDto, usersignup.user_id, loggedInUser, transactionSession);
            if(employee.status === true) {
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

    async createEmployee(employeeData: any, user_id: string, loggedInUser: string, session: mongoose.ClientSession | null = null) {
        // Create Employee Id
        const employee_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.EMPLOYEE,
            session,
        );

        if (!employeeData.role_id) {
            // Get role
            const role = await this.roleService.getRoleByCompany(employeeData.entity_id, UserType.Employee);
        }

        const employee = new Employee();
        employee.employee_id = employee_id;
        employee.user_id = user_id;
        employee.first_name = employeeData.first_name;
        employee.last_name = employeeData.last_name;
        employee.entity_id = employeeData.entity_id;
        employee.employee_code = employeeData.employee_code;
        employee.role_id = employeeData.role_id;
        employee.qualification = employeeData.qualification;
        employee.gender = employeeData.gender;
        employee.date_of_birth = employeeData.date_of_birth;
        employee.date_of_joining = employeeData.date_of_joining;
        employee.created_at = AppUtils.getIsoUtcMoment();
        employee.updated_at = AppUtils.getIsoUtcMoment();
        employee.created_by = loggedInUser;
        employee.updated_by = loggedInUser;

        try {
            await this.employeeModel.create([employee], { session });
            return { status: true, data: 'success' };
        } catch (e) {
            return { status: false, data: e };
        }
    }

    // GET All Employees list
    async getEmployees(
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
                    { employee_code: { $regex: search } },
                ],
                entity_id: entity_id,
                status: 1,
            };
        } else {
            params = { entity_id: entity_id, status: 1 };
        }
        const count = await this.employeeModel.count(params).exec();
        const list = await this.employeeModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Employee by Id
    async getEmployeeById(id: string, loggedInUser: User) {
        const employee = await this.employeeModel
            .findOne({ employee_id: id })
            .exec();
        return employee;
    }

    // Update Employee by Id
    async updateEmployee(
        employee_id: string,
        employeeDto: EmployeeDto,
        loggedInUser: User,
    ) {
        const employee = await this.employeeModel.findOne({ employee_id }).exec();
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }
        employee.first_name = employeeDto.first_name;
        employee.last_name = employeeDto.last_name;
        employee.entity_id = employeeDto.entity_id;
        employee.employee_code = employeeDto.employee_code;
        employee.role_id = employeeDto.role_id;
        employee.qualification = employeeDto.qualification;
        employee.gender = employeeDto.gender;
        employee.date_of_birth = employeeDto.date_of_birth;
        employee.date_of_joining = employeeDto.date_of_joining;
        employee.updated_at = AppUtils.getIsoUtcMoment();
        employee.updated_by = loggedInUser.user_id;
        return this.employeeModel.updateOne({ employee_id }, employee);
    }

    // Delete Employee by Id
    async deleteEmployee(employee_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const employee = await this.employeeModel.findOne({ employee_id }).exec();
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        try {
            await this.employeeModel.updateOne([{ employee_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

    // Restore Employee by Id
    async restoreEmployee(employee_id: string, loggedInUser: User) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const employee = await this.employeeModel.findOne({ employee_id }).exec();
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        try {
            await this.employeeModel.updateOne([{ employee_id }, { status: 1 }], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
        return;
    }

}
