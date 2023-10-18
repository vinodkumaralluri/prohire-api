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
import { Entity, EntityDocument } from './schemas/entity.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { EntityDto } from './dto/entity.dto';
import { User } from '../users/schemas/user.schema';
import { UserType } from 'src/enums/user-type.enum';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../role/role.service';
import { EmployeeService } from '../employee/employee.service';
import { ModuleType } from '../../enums/module-type.enum';
import { PermissionType } from '../../enums/permission.enum';
import { EntityType } from 'src/enums/entity-type.enum';

@Injectable()
export class EntityService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Entity.name) private entityModel: Model<EntityDocument>,
        private autoIncrementService: AutoIncrementService,
        private authService: AuthService,
        private roleService: RoleService,
        private employeeservice: EmployeeService,
    ) { }

    // Query Entity
    async queryEntity(filter: any) {
        const entity = await this.entityModel.findOne(filter).exec();
        return entity;
    }

    // Add Entity
    async addEntity(entityDto: EntityDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Entity Name
        const entitycheck = await this.entityModel
            .findOne({ name: entityDto.name, status: 1 })
            .exec();
        if (entitycheck) {
            throw new BadRequestException('Entity already exists');
        }
        // Create Entity Id
        const entity_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.ENTITY,
            transactionSession,
        );

        const entity = new Entity();
        entity.entity_id = entity_id;
        entity.entity_type = entityDto.entity_type;
        entity.name = entityDto.name;
        entity.email = entityDto.email;
        entity.phone = entityDto.phone;
        entity.created_at = AppUtils.getIsoUtcMoment();
        entity.updated_at = AppUtils.getIsoUtcMoment();
        entity.created_by = loggedInUser;
        entity.updated_by = loggedInUser;

        try {
            await this.entityModel.create([entity], { transactionSession });

            // Create User SignUp
            const user = {
                phone_number: entityDto.phone_number,
                email: entityDto.admin_email,
                user_type: UserType.CompanyAdmin,
                password: entityDto.phone_number,
            }
            let usersignup = await this.authService.signUp(user, transactionSession);

            if (usersignup.status === true) {

                // Create Role for Admin of the Company
                const Companyrole = {
                    entity_id: entity_id,
                    role: UserType.CompanyAdmin,
                }

                const companyuserrole = await this.roleService.addRole(Companyrole, usersignup.user_id, transactionSession);

                if (companyuserrole.status === true) {
                    const permissions = [
                        { role_id: companyuserrole.data, module: ModuleType.Company, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Complaint, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Customer, permission: PermissionType.View },
                        { role_id: companyuserrole.data, module: ModuleType.Employee, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Item, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Model, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Product, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Purchase, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Rating, permission: PermissionType.View },
                        { role_id: companyuserrole.data, module: ModuleType.Review, permission: PermissionType.View },
                        { role_id: companyuserrole.data, module: ModuleType.ServiceCenter, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Store, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Task, permission: PermissionType.Edit },
                        { role_id: companyuserrole.data, module: ModuleType.Warranty, permission: PermissionType.Edit }
                    ];
                    for (let i = 0; i < permissions.length; i++) {
                        const permission = await this.roleService.addPermission(permissions[i], usersignup.user_id, transactionSession);
                        if (permission.status === false) {
                            await transactionSession.abortTransaction();
                            return { status: false, user_id: usersignup.user_id, message: permission.data };
                        }
                    }
                } else {
                    await transactionSession.abortTransaction();
                    return { status: false, data: companyuserrole.message };
                }

                // Create an Admin as Employee in the Company 
                const admin = {
                    user_id: usersignup.user_id,
                    first_name: entityDto.first_name,
                    last_name: entityDto.last_name,
                    entity_id: entity_id,
                    role_id: companyuserrole.data,
                }
                await this.employeeservice.createEmployee(admin, usersignup.user_id, loggedInUser, transactionSession);

                // Create Role for the Employee
                const Employee_role = {
                    entity_id: entity_id,
                    role: UserType.Employee,
                }
                const Employeeuserrole = await this.roleService.addRole(Employee_role, usersignup.user_id, transactionSession);
                if (Employeeuserrole.status === true) {
                    const permissions = [
                        { role_id: Employeeuserrole.data, module: ModuleType.Company, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Complaint, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Customer, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Employee, permission: PermissionType.Edit },
                        { role_id: Employeeuserrole.data, module: ModuleType.Item, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Model, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Product, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Purchase, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Rating, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Review, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.ServiceCenter, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Store, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Task, permission: PermissionType.View },
                        { role_id: Employeeuserrole.data, module: ModuleType.Warranty, permission: PermissionType.View }
                    ];
                    try {
                        for (let i = 0; i < permissions.length; i++) {
                            const permission = await this.roleService.addPermission(permissions[i], usersignup.user_id, transactionSession);
                            if (permission.status === false) {
                                await transactionSession.abortTransaction();
                                return { status: false, user_id: usersignup.user_id, message: permission.data };
                            }
                        }
                    } catch (e) {
                        await transactionSession.abortTransaction();
                        return { status: false, user_id: usersignup.user_id, message: e };
                    }
                } else {
                    await transactionSession.abortTransaction();
                    return { status: false, user_id: usersignup.user_id, message: Employeeuserrole.message };
                }
            }
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Entities list
    async getEntities(
        entity_type: EntityType,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = { entity_type: entity_type, status: 1 };
        if (search) {
            params.name = { $regex: search };
        }
        const count = await this.entityModel.count(params).exec();
        const list = await this.entityModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET entity_type by Id
    async getEntityById(id: string) {
        const entity = await this.entityModel
            .findOne({ entity_id: id })
            .exec();
        return entity;
    }

    // Update Entity by Id
    async updateEntity(
        entity_id: string,
        entityDto: EntityDto,
        loggedInUser: string,
    ) {
        const entity = await this.entityModel.findOne({ entity_id }).exec();
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        entity.name = entityDto.name;
        entity.email = entityDto.email;
        entity.phone = entityDto.phone;
        entity.updated_at = AppUtils.getIsoUtcMoment();
        entity.updated_by = loggedInUser;
        try {
            await this.entityModel.updateOne([{ entity_id }, entity], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Entity by Id
    async deleteEntity(entity_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const entity = await this.entityModel.findOne({ entity_id }).exec();
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }
        try {
            await this.entityModel.updateOne([{ entity_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Entity by Id
    async restoreEntity(entity_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const entity = await this.entityModel.findOne({ entity_id }).exec();
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }
        try {
            await this.entityModel.updateOne([{ entity_id }, { status: 0 }], { transactionSession });
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

