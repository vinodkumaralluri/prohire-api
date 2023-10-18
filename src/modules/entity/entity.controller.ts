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
import { EntityType } from 'src/enums/entity-type.enum';
import { TransformInterceptor } from '../../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EntityDto } from './dto/entity.dto';
import { EntityService } from './entity.service';

@Controller({
    path: 'entity',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Entity')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class EntityController {
    constructor(private readonly entityservice: EntityService) { }

    // Add Entity
    @Post('/addEntity')
    @ApiOperation({ summary: 'Add Entity' })
    @ApiOkResponse({
        description: 'Entity added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addEntity(@Body() entityDto: EntityDto, @Request() req) {
        const entity = await this.entityservice.addEntity(
            entityDto,
            req.user.user_id,
        );
        if (entity.status == true) {
            return { status: true, message: 'Entity added successfully' };
        } else {
            throw new NotImplementedException(entity.data);
        }
    }

    // Update Entity
    @Put('/editEntity/:entity_id')
    @ApiOperation({ summary: 'Update Entity' })
    @ApiOkResponse({
        description: 'Entity updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateEntity(
        @Request() req,
        @Param('entity_id') entity_id: string,
        @Body() entityDto: EntityDto,
    ) {
        await this.entityservice.updateEntity(
            entity_id,
            entityDto,
            req.user.user_id,
        );
        return { status: true, message: 'Entity updated successfully', data: true };
    }

    // GET All Entities list
    @Get('/getEntities/:entity_type')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Entities' })
    @ApiOkResponse({
        description: 'Entities fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getEntities(
        @Param('entity_type') entity_type: EntityType,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const entities = await this.entityservice.getEntities(
            entity_type,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Entities fetched successfully', data: entities };
    }

    // GET Entity by Id
    @Get('/getEntityById/:entity_id')
    @ApiOperation({ summary: 'Get Entity By Id' })
    @ApiOkResponse({
        description: 'Entity fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getEntityById(
        @Param('entity_id') entity_id: string,
    ) {
        const entity = await this.entityservice.getEntityById(
            entity_id,
        );
        return { status: true, message: 'Entity fetched successfully', data: entity };
    }

    // Delete Entity
    @Delete('/deleteEntity/:entity_id')
    @ApiOperation({ summary: 'Delete Entity' })
    @ApiOkResponse({
        description: 'Entity deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteEntity(
        @Param('entity_id') entity_id: string
    ) {
        await this.entityservice.deleteEntity(
            entity_id,
        );
        return { message: 'Entity deleted successfully', data: true };
    }

    // Restore Entity
    @Delete('/restoreEntity/:entity_id')
    @ApiOperation({ summary: 'Restore Entity' })
    @ApiOkResponse({
        description: 'Entity restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreEntity(
        @Param('entity_id') entity_id: string,
    ) {
        await this.entityservice.restoreEntity(
            entity_id,
        );
        return { message: 'Entity restored successfully', data: true };
    }

}
