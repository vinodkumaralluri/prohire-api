import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { SignUpDto } from './dto/signup.dto';
import { CompanyDto } from '../company/dto/company.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { Permission, PermissionDocument } from '../role/schemas/permission.schema';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AppUtils } from '../../utils/app.utils';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { RoleService } from '../role/role.service';
import { ModuleType } from 'src/enums/module-type.enum';
import { PermissionType } from 'src/enums/permission.enum';
import * as mongoose from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private userService: UserService,
    private roleService: RoleService,
    private jwtService: JwtService,
    private autoIncrementService: AutoIncrementService,
  ) { }

  // User Signup API
  async createSuperAdmin(adminDto: CompanyDto) {

    // starting session on mongoose default connection
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    // Check for the User Existence
    const existingUser = await this.userService.queryUser({
      $or: [
        { email: adminDto.email },
        { phone_number: adminDto.phone_number },
      ],
      status: 1,
    });
    if (existingUser) {
      if (existingUser.email === adminDto.email) {
        throw new BadRequestException('User with this Email Id already exists');
      }
      if (existingUser.phone_number === adminDto.phone_number) {
        throw new BadRequestException(
          'User with this Phone number already exists',
        );
      }
    }
    // Create User Id
    const user_id = await this.autoIncrementService.getNextSequence(
      AutoIncrementEnum.USER,
    );
    // Create User Schema
    const user = new User();
    user.user_id = user_id;
    user.email = adminDto.email;
    user.phone_number = adminDto.phone_number;
    user.user_type = UserType.SuperAdmin;
    user.password = 'Admin@123',
    user.password = await AppUtils.getEncryptedPassword('Admin@123');
    user.is2FaEnabled = false,
    user.otp = '',
    user.otpExpiry = '',
    user.last_login_date = '',
    user.created_at = AppUtils.getIsoUtcMoment();
    user.updated_at = AppUtils.getIsoUtcMoment();
    user.created_by = user_id;
    user.updated_by = user_id;

    try {
      // Create User in the Db
      await this.userModel.create([user], {transactionSession});
      // Check for Company Name
      const companycheck = await this.companyModel
        .findOne({ company_name: 'ProService', status: 1 })
        .exec();
      if (companycheck) {
        throw new BadRequestException('Company already exists');
      }
      // Create Company Id
      const company_id = await this.autoIncrementService.getNextSequence(
        AutoIncrementEnum.COMPANY,
        transactionSession,
      );
      const company = new Company();
      company.company_id = company_id;
      company.user_id = user_id;
      company.company_name = adminDto.company_name;
      company.email = adminDto.company_email;
      company.contact_number = adminDto.contact_number;
      company.toll_free = adminDto.toll_free;
      company.owner_first_name = adminDto.first_name;
      company.owner_last_name = adminDto.last_name;
      company.owner_phone_number = adminDto.phone_number;
      company.owner_email = adminDto.email;
      company.owner_gender = adminDto.gender;
      company.owner_dob = adminDto.dob;
      company.head_office = adminDto.head_office;
      company.address = adminDto.address;
      company.city = adminDto.city;
      company.state = adminDto.state;
      company.pincode = adminDto.pincode;
      company.created_at = AppUtils.getIsoUtcMoment();
      company.updated_at = AppUtils.getIsoUtcMoment();
      company.created_by = user_id;
      company.updated_by = user_id;

      try {
        await this.companyModel.create([company], {transactionSession});
        // Create Role for the Super Admin
        const SuperAdmin_role = {
          entity_id: company_id,
          role: UserType.SuperAdmin,
        }
        const Companyuserrole = await this.roleService.addRole(SuperAdmin_role, user_id, transactionSession);
        if (Companyuserrole.status === true) {
          const permissions = [
            { role_id: Companyuserrole.data, module: ModuleType.Company, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Complaint, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Customer, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Employee, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Item, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Model, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Product, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Purchase, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Rating, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Review, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.ServiceCenter, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Store, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Task, permission: PermissionType.Edit },
            { role_id: Companyuserrole.data, module: ModuleType.Warranty, permission: PermissionType.Edit }
          ];
          try {
            for (let i = 0; i < permissions.length; i++) {
              const permission = await this.roleService.addPermission(permissions[i], user_id, transactionSession);
              if (permission.status === false) {
                return { status: false, user_id: user_id, message: permission.data };
              }
            }
          } catch (e) {
            return { status: false, user_id: user_id, message: e };
          }
        } else {
          return { status: false, user_id: user_id, message: Companyuserrole.message };
        }
        // Create Role for the Employee
        const Employee_role = {
          entity_id: company_id,
          role: UserType.Employee,
        }
        const Employeeuserrole = await this.roleService.addRole(Employee_role, user_id, transactionSession);
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
              const permission = await this.roleService.addPermission(permissions[i], user_id, transactionSession);
              if (permission.status === false) {
                return { status: false, user_id: user_id, message: permission.data };
              }
            }
          } catch (e) {
            return { status: false, user_id: user_id, message: e };
          }
        } else {
          return { status: false, user_id: user_id, message: Employeeuserrole.message };
        }
        await transactionSession.commitTransaction();
        return { status: true, user_id: user_id, message: 'Success' };
      } catch (e) {
        await transactionSession.abortTransaction();
        return { status: false, user_id: user_id, message: e };
      }
    } catch (e) {
      await transactionSession.abortTransaction();
      return { status: false, user_id: user_id, message: e };
    } finally {
      await transactionSession.endSession();
    }
  }

  // User Signup API
  async signUp(signUpDto: SignUpDto, session: mongoose.ClientSession | null = null) {
    const existingUser = await this.userService.queryUser({
      $or: [
        { email: signUpDto.email },
        { phone_number: signUpDto.phone_number },
      ],
      status: 1,
    });
    if (existingUser) {
      if (existingUser.email === signUpDto.email) {
        throw new BadRequestException('User with this Email Id already exists');
      }
      if (existingUser.phone_number === signUpDto.phone_number) {
        throw new BadRequestException(
          'User with this Phone number already exists',
        );
      }
    }
    // Create User Id
    const user_id = await this.autoIncrementService.getNextSequence(
      AutoIncrementEnum.USER,
      session,
    );
    // Create User Schema
    const user = new User();
    user.user_id = user_id;
    user.email = signUpDto.email;
    user.phone_number = signUpDto.phone_number;
    user.user_type = signUpDto.user_type;
    user.password = await AppUtils.getEncryptedPassword(
      signUpDto.password ? signUpDto.password : signUpDto.phone_number,
    );
    (user.is2FaEnabled = false),
      (user.otp = ''),
      (user.otpExpiry = ''),
      (user.last_login_date = ''),
      (user.created_at = AppUtils.getIsoUtcMoment());
    user.updated_at = AppUtils.getIsoUtcMoment();
    user.created_by = user_id;
    user.updated_by = user_id;

    try {
      // Create User in the Db
      const usercreate = await this.userModel.create([user], { session });
      return { status: true, user_id: user_id, message: 'Success' };
    } catch (e) {
      return { status: false, user_id: user_id, message: e };
    }
  }

  // User Login API
  async login(user: User) {
    const {
      user_id,
      email,
      phone_number,
      user_type,
      is2FaEnabled,
    } = user;
    const login_date = AppUtils.getIsoUtcMoment();
    await this.userModel.updateOne(
      { user_id: user_id },
      { last_login_date: login_date },
    );

    // GET User Role
    const userrole = await this.roleModel.findOne({ user_id: user_id, status: 1 }).exec();

    const role = userrole.role;

    // GET Permissions
    const permissions = await this.permissionModel.aggregate([
      {
        $match: { role_id: userrole.role_id, status: 1 },
      },
      {
        $project: {
          module: '$module',
          permission: '$permission',
        }
      }
    ])

    return {
      access_token: this.jwtService.sign({
        sub: user_id,
        user_id,
        email,
        phone_number,
        user_type,
        role,
      }),
      email,
      is2FaEnabled,
      phone_number,
      user_type,
      permissions,
    };
  }

  async sendOtp(user: User) {
    return this.userService.sendOtp(user.user_id);
  }

  async verifyOtp(user: User, otp: string) {
    return this.userService.verifyOtp(user.user_id, otp);
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(
      user.user_id,
      changePasswordDto.password,
    );
  }

  async validateUser(username: string, password: string) {
    const findUser = await this.userService.queryUser({ email: username });
    if (!findUser) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isValid = await bcrypt.compare(password, findUser.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return findUser;
  }

  async userrollback(rollbackpoint: string) {
    if (rollbackpoint == 'user') {
      // Rollback User Id
      await this.autoIncrementService.getprevious(AutoIncrementEnum.USER);
      return;
    } else {
      return;
    }
  }

}
