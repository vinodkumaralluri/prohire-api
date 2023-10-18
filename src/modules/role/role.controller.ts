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
import { RoleDto } from './dto/role.dto';
import { PermissionDto } from './dto/permission.dto';
import { RoleService } from './role.service';

@Controller({
    path: 'role',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Role')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class RoleController {
    constructor(private readonly roleservice: RoleService) { }

    // Add Role
    @Post('/addRole')
    @ApiOperation({ summary: 'Add Role' })
    @ApiOkResponse({
        description: 'Role added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addRole(@Body() roleDto: RoleDto, @Request() req) {
        const role = await this.roleservice.addRole(
            roleDto,
            req.user.user_id,
        );
        if (role.status == true) {
            return { message: 'Role added successfully' };
        } else {
            throw new NotImplementedException(role.data);
        }
    }

    // Update Role
    @Put('/editRole/:role_id')
    @ApiOperation({ summary: 'Update Role' })
    @ApiOkResponse({
        description: 'Role updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateRole(
        @Request() req,
        @Param('role_id') role_id: string,
        @Body() roleDto: RoleDto,
    ) {
        await this.roleservice.updateRole(
            role_id,
            roleDto,
            req.user,
        );
        return { message: 'Role updated successfully', data: true };
    }

    // GET All Roles
    @Get('/getRoles/:entity_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Roles' })
    @ApiOkResponse({
        description: 'Roles fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getRoles(
        @Request() req,
        @Param('entity_id') entity_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const roles = await this.roleservice.getRoles(
            req.user,
            page,
            limit,
            search,
        );
        return { message: 'Roles fetched successfully', data: roles };
    }

    // GET Role by Id
    @Get('/getRoleById/:role_id')
    @ApiOperation({ summary: 'Get Role By Id' })
    @ApiOkResponse({
        description: 'Role fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getRoleById(
        @Request() req,
        @Param('role_id') role_id: string,
    ) {
        const role = await this.roleservice.getRoleById(
            role_id,
            req.user,
        );
        return { message: 'Role fetched successfully', data: role };
    }

    // Delete Role
    @Delete('/deleteRole/:role_id')
    @ApiOperation({ summary: 'Delete Role' })
    @ApiOkResponse({
        description: 'Role deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteRole(@Request() req, @Param('role_id') role_id: string) {
        await this.roleservice.deleteRole(
            role_id,
            req.user,
        );
        return { message: 'Role deleted successfully', data: true };
    }

    // Restore Role
    @Put('/restoreRole/:role_id')
    @ApiOperation({ summary: 'Restore Role' })
    @ApiOkResponse({
        description: 'Role restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreRole(
        @Request() req,
        @Param('role_id') role_id: string,
    ) {
        await this.roleservice.restoreRole(
            role_id,
            req.user,
        );
        return { message: 'Role restored successfully', data: true };
    }

    // Add Permission
    @Post('/addPermission')
    @ApiOperation({ summary: 'Add Permission' })
    @ApiOkResponse({
        description: 'Permission added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addPermission(@Body() permissionDto: PermissionDto, @Request() req) {
        const permission = await this.roleservice.addPermission(
            permissionDto,
            req.user.user_id,
        );
        if (permission.status == true) {
            return { message: 'Permission added successfully' };
        } else {
            throw new NotImplementedException(permission.data);
        }
    }

    // Update Permission
    @Put('/editPermission/:permission_id')
    @ApiOperation({ summary: 'Update Permission' })
    @ApiOkResponse({
        description: 'Permission updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updatePermission(
        @Request() req,
        @Param('permission_id') permission_id: string,
        @Body() permissionDto: PermissionDto,
    ) {
        await this.roleservice.updatePermission(
            permission_id,
            permissionDto,
            req.user,
        );
        return { message: 'Permission updated successfully', data: true };
    }

    // GET All Permissions list
    @Get('/getPermissions/:role_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Permissions' })
    @ApiOkResponse({
        description: 'Permissions fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPermissions(
        @Request() req,
        @Param('role_id') role_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const permissions = await this.roleservice.getPermissions(
            req.user,
            role_id,
            page,
            limit,
            search,
        );
        return { message: 'Permissions fetched successfully', data: permissions };
    }

    // GET Permission by Id
    @Get('/getPermissionById/:permission_id')
    @ApiOperation({ summary: 'Get Permission By Id' })
    @ApiOkResponse({
        description: 'Permission fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getPermissionById(
        @Request() req,
        @Param('permission_id') permission_id: string,
    ) {
        const permission = await this.roleservice.getPermissionById(
            permission_id,
            req.user,
        );
        return { message: 'Permission fetched successfully', data: permission };
    }

    // Delete Permission
    @Delete('/deletePermission/:permission_id')
    @ApiOperation({ summary: 'Delete Permission' })
    @ApiOkResponse({
        description: 'Permission deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deletePermission(@Request() req, @Param('permission_id') permission_id: string) {
        await this.roleservice.deletePermission(
            permission_id,
            req.user,
        );
        return { message: 'Permission deleted successfully', data: true };
    }

    // Restore Permission
    @Put('/restorePermission/:permission_id')
    @ApiOperation({ summary: 'Restore Permission' })
    @ApiOkResponse({
        description: 'Permission restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restorePermission(
        @Request() req,
        @Param('permission_id') permission_id: string,
    ) {
        await this.roleservice.restorePermission(
            permission_id,
            req.user,
        );
        return { message: 'Permission restored successfully', data: true };
    }

}
