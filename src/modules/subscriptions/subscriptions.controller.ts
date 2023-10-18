import {
    Body,
    Controller,
    Param,
    Post,
    Put,
    Delete,
    UseGuards,
    UseInterceptors,
    Request,
    Get,
    Query,
    NotImplementedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionDto } from './dto/subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller({
    path: 'subscriptions',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Subscriptions')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class SubscriptionsController {
    constructor(private readonly subscriptionservice: SubscriptionsService) { }

    // Add Subscription
    @Post('/addSubscription')
    @ApiOperation({ summary: 'Add Subscription' })
    @ApiOkResponse({
        description: 'Subscription added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addSubscription(@Body() subscriptionDto: SubscriptionDto, @Request() req) {
        const subscription = await this.subscriptionservice.addSubscription(
            subscriptionDto,
            req.user.user_id,
        );
        if (subscription.status == true) {
            return { status: true, message: 'Subscription added successfully' };
        } else {
            throw new NotImplementedException(subscription.data);
        }
    }

    // Update Subscription
    @Put('/editSubscription/:subscription_id')
    @ApiOperation({ summary: 'Update Subscription' })
    @ApiOkResponse({
        description: 'Subscription updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateSubscription(
        @Request() req,
        @Param('subscription_id') subscription_id: string,
        @Body() subscriptionDto: SubscriptionDto,
    ) {
        await this.subscriptionservice.updateSubscription(
            subscription_id,
            subscriptionDto,
            req.user.user_id,
        );
        return { status: true, message: 'Subscription updated successfully', data: true };
    }

    // GET All Subscriptions list
    @Get('/getSubscriptions/:id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Subscriptions' })
    @ApiOkResponse({
        description: 'Subscriptions fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getSubscriptions(
        @Param('id') id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const subscriptions = await this.subscriptionservice.getSubscriptions(
            id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Subscriptions fetched successfully', data: subscriptions };
    }

    // GET Subscription by Id
    @Get('/getSubscriptionById/:subscription_id')
    @ApiOperation({ summary: 'Get Subscription By Id' })
    @ApiOkResponse({
        description: 'Subscription fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getSubscriptionById(
        @Param('subscription_id') subscription_id: string,
    ) {
        const subscription = await this.subscriptionservice.getSubscriptionById(
            subscription_id,
        );
        return { status: true, message: 'Subscription fetched successfully', data: subscription };
    }

    // Delete Subscription
    @Delete('/deleteSubscription/:subscription_id')
    @ApiOperation({ summary: 'Delete Subscription' })
    @ApiOkResponse({
        description: 'Subscription deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteSubscription(@Param('subscription_id') subscription_id: string) {
        await this.subscriptionservice.deleteSubscription(
            subscription_id,
        );
        return { message: 'Subscription deleted successfully', data: true };
    }

    // Restore Subscription
    @Delete('/restoreSubscription/:subscription_id')
    @ApiOperation({ summary: 'Restore Subscription' })
    @ApiOkResponse({
        description: 'Subscription restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreSubscription(
        @Param('subscription_id') subscription_id: string,
    ) {
        await this.subscriptionservice.restoreSubscription(
            subscription_id,
        );
        return { message: 'Subscription restored successfully', data: true };
    }

}



