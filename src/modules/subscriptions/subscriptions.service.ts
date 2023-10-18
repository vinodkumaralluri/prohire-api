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
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';
import { AutoIncrementService } from '../auto-increment/auto-increment.service';
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';
import { SubscriptionDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Subscription
    async querySubscription(filter: any) {
        const subscription = await this.subscriptionModel.findOne(filter).exec();
        return subscription;
    }

    // Add Subscription
    async addSubscription(subscriptionDto: SubscriptionDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const subscription = await this.createSubscription(subscriptionDto, loggedInUser, transactionSession);

        if (subscription.status === true) {
            await transactionSession.commitTransaction();
            await transactionSession.endSession();
            return { status: true, data: 'success' };
        } else {
            await transactionSession.abortTransaction();
            await transactionSession.endSession();
            return { status: false, data: 'Failed' };
        }

    }

    async createSubscription(subscriptionData: any, loggedInUser: string, session: mongoose.ClientSession | null = null) {

        // Create Subscription Id
        const subscription_id = await this.autoIncrementService.getNextSequence(
            AutoIncrementEnum.SUBSCRIPTION,
            session,
        );

        const subscription = new Subscription();
        subscription.subscription_id = subscription_id;
        subscription.entity_id = subscriptionData.entity_id;
        subscription.student_id = subscriptionData.student_id;
        subscription.created_at = AppUtils.getIsoUtcMoment();
        subscription.updated_at = AppUtils.getIsoUtcMoment();
        subscription.created_by = loggedInUser;
        subscription.updated_by = loggedInUser;

        try {
            await this.subscriptionModel.create([subscription], { session });
            return { status: true, data: 'success' };
        } catch (e) {
            return { status: false, data: e };
        }
    }

    // GET All Subscriptions list
    async getSubscriptions(
        id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = {
            $or: [
                { entity_id: id },
                { student_id: id },
            ],
            status: 1
        }
        const count = await this.subscriptionModel.count(params).exec();
        const list = await this.subscriptionModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Subscription  by Id
    async getSubscriptionById(id: string) {
        const subscription = await this.subscriptionModel
            .findOne({ subscription_id: id})
            .exec();
        return subscription;
    }

    // Update Subscription by Id
    async updateSubscription(
        subscription_id: string,
        subscriptionDto: SubscriptionDto,
        loggedInUser: string,
    ) {
        const subscription = await this.subscriptionModel.findOne({ subscription_id }).exec();
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        subscription.student_id = subscriptionDto.student_id;
        subscription.entity_id = subscriptionDto.entity_id;
        subscription.updated_at = AppUtils.getIsoUtcMoment();
        subscription.updated_by = loggedInUser;
        try {
            await this.subscriptionModel.updateOne([{ subscription_id }, subscription], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Subscription by Id
    async deleteSubscription(subscription_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const subscription = await this.subscriptionModel.findOne({ subscription_id }).exec();
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }
        try {
            await this.subscriptionModel.updateOne([{ subscription_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Subscription by Id
    async restoreSubscription(subscription_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const subscription = await this.subscriptionModel.findOne({ subscription_id }).exec();
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }
        try {
            await this.subscriptionModel.updateOne([{ subscription_id }, { status: 1 }], { transactionSession });
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



