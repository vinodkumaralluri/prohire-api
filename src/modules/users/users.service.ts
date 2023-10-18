import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserType } from '../../enums/user-type.enum';
import { AppConstant } from '../../utils/app.constants';
import { AppUtils } from '../../utils/app.utils';
import { User, UserDocument } from './schemas/user.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import * as moment from 'moment';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query User by Filter
    async queryOne(filter: any) {
        const user = await this.userModel.findOne(filter).exec();
        return user;
    }

    async findByUserId(user_id: string) {
        const user = this.queryOne({ user_id: user_id, status: 1 });
        if (!user) {
            throw new NotFoundException('User not found.');
        }
        return user;
    }

    // DELETE User API
    async deleteUser(user_id: string, loggedInUser: User, permissions) {
        if (
            loggedInUser.user_type === UserType.SuperAdmin ||
            loggedInUser.user_type === UserType.System
        ) {
            const permission = permissions.filter(
                (mod) => mod.module === Modules.USERS,
            )[0].permission;
            if (!permission || permission !== Permission.EDIT) {
                throw new UnauthorizedException(
                    'You are not authorized to do this operation.',
                );
            }

            const user = await this.userModel.findOne({ user_id }).exec();
            if (!user) {
                throw new NotFoundException('User not found');
            }

            try {
                await this.userModel.updateOne({ user_id }, { status: 0 });
            } catch (e) {
                return { status: false, data: e };
            }
        } else {
            throw new UnauthorizedException(
                'You are not authorized to do this operation.',
            );
        }
    }
}
