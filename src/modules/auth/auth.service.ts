import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';

// mongoose
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// Schemas
import { User, UserDocument } from '../users/schemas/user.schema';
import { Company, CompanyDocument } from '../company/schemas/company.schema';
import { Role, RoleDocument } from '../role/schemas/role.schema';
import { Permission, PermissionDocument } from '../role/schemas/permission.schema';

// Dto
import { SignUpDto } from './dto/signup.dto';
import { CompanyDto } from '../company/dto/company.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UserType } from 'src/enums/user-type.enum';
import { ModuleType } from 'src/enums/module-type.enum';
import { PermissionType } from 'src/enums/permission.enum';

// Services
import { UsersService } from '../users/users.service';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { RoleService } from '../role/role.service';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private userservice: UsersService,
    private roleservice: RoleService,
    private jwtservice: JwtService,
    private autoIncrementservice: AutoIncrementService,
  ) { }

  // User Signup API
  async createSuperAdmin(adminDto: CompanyDto) {

    // starting session on mongoose default connection
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();

    // Check for the User Existence
    const existingUser = await this.userservice.queryUser({
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
    const user_id = await this.autoIncrementservice.getNextSequence(
      AutoIncrementEnum.USER,
    );

    // Create User Schema
    const user = new User();
    user.user_id = user_id;
    user.email = adminDto.email;
    user.phone_number = adminDto.phone_number;
    user.user_type = UserType.SuperAdmin;
    user.password = await AppUtils.getEncryptedPassword('Admin@123');
    user.is2FaEnabled = false,
    user.otp = AppUtils.generateOtp();
    user.otpExpiry = AppUtils.getExpiryDate();
    user.last_login_date = '',
    user.created_at = AppUtils.getIsoUtcMoment();
    user.updated_at = AppUtils.getIsoUtcMoment();
    user.created_by = user_id;
    user.updated_by = user_id;

    try {
      // Create User in the Db
      await this.userModel.create([user], { transactionSession });
      // Check for Company Name
      const companycheck = await this.companyModel
        .findOne({ company_name: 'ProHire', status: 1 })
        .exec();
      if (companycheck) {
        throw new BadRequestException('Company already exists');
      }

      // Create Company Id
      const company_id = await this.autoIncrementservice.getNextSequence(
        AutoIncrementEnum.COMPANY,
        transactionSession,
      );

      const company = new Company();
      company.company_id = company_id;
      company.user_id = user_id;
      company.name = adminDto.name;
      company.email = adminDto.email;
      company.phone_number = adminDto.phone_number;
      company.created_at = AppUtils.getIsoUtcMoment();
      company.updated_at = AppUtils.getIsoUtcMoment();
      company.created_by = user_id;
      company.updated_by = user_id;

      try {
        await this.companyModel.create([company], { transactionSession });
        // Create Role for the Super Admin
        const SuperAdmin_role = {
          entity_id: company_id,
          role: UserType.SuperAdmin,
        }
        const SuperAdminrole = await this.roleservice.addRole(SuperAdmin_role, user_id, transactionSession);

        // Add Permissions to the Super Admin
        if (SuperAdminrole.status === true) {
          var permissions = await this.roleservice.superAdmin_permissions();
          try {
            for (let i = 0; i < permissions.length; i++) {
              const permission = await this.roleservice.addPermission(permissions[i], user_id, transactionSession);
              if (permission.status === false) {
                return { status: false, user_id: user_id, message: permission.data };
              }
            }
          } catch (e) {
            return { status: false, user_id: user_id, message: e };
          }
        } else {
          return { status: false, user_id: user_id, message: SuperAdminrole.message };
        }
        
        // Create Role for the Employee
        const Employee_role = {
          entity_id: company_id,
          role: UserType.Employee,
        }
        const Employeeuserrole = await this.roleservice.addRole(Employee_role, user_id, transactionSession);
        if (Employeeuserrole.status === true) {
          var permissions = await this.roleservice.employee_permissions();
          try {
            for (let i = 0; i < permissions.length; i++) {
              const permission = await this.roleservice.addPermission(permissions[i], user_id, transactionSession);
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
    const existingUser = await this.userservice.queryUser({
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
    const user_id = await this.autoIncrementservice.getNextSequence(
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
    user.is2FaEnabled = false,
    user.otp = AppUtils.generateOtp();
    user.otpExpiry = AppUtils.getExpiryDate();
    user.last_login_date = '',
    user.created_at = AppUtils.getIsoUtcMoment();
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
      access_token: this.jwtservice.sign({
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
    return this.userservice.sendOtp(user.user_id);
  }

  async verifyOtp(user: User, otp: string) {
    return this.userservice.verifyOtp(user.user_id, otp);
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    return this.userservice.changePassword(
      user.user_id,
      changePasswordDto.password,
    );
  }

  async validateUser(username: string, password: string) {
    const findUser = await this.userservice.queryUser({ email: username });
    if (!findUser) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isValid = await bcrypt.compare(password, findUser.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return findUser;
  }

}
