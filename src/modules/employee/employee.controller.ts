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
import { EmployeeDto } from './dto/employee.dto';
import { EmployeeService } from './employee.service';

@Controller({
    path: 'employee',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Employee')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class EmployeeController {
    constructor(private readonly employeeservice: EmployeeService) { }

    // Add Employee
    @Post('/addEmployee')
    @ApiOperation({ summary: 'Add Employee' })
    @ApiOkResponse({
        description: 'Employee added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async addEmployee(@Body() employeeDto: EmployeeDto, @Request() req) {
        const employee = await this.employeeservice.addEmployee(
            employeeDto,
            req.user,
        );
        if (employee.status == true) {
            return { message: 'Employee added successfully' };
        } else {
            throw new NotImplementedException(employee.data);
        }
    }

    // Update Employee
    @Put('/editEmployee/:employee_id')
    @ApiOperation({ summary: 'Update Employee' })
    @ApiOkResponse({
        description: 'Employee updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateEmployee(
        @Request() req,
        @Param('employee_id') employee_id: string,
        @Body() employeeDto: EmployeeDto,
    ) {
        await this.employeeservice.updateEmployee(
            employee_id,
            employeeDto,
            req.user,
        );
        return { message: 'Employee updated successfully', data: true };
    }

    // GET All Employees list
    @Get('/getEmployees/:company_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Employees' })
    @ApiOkResponse({
        description: 'Employees fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getEmployees(
        @Request() req,
        @Param('company_id') company_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const employees = await this.employeeservice.getEmployees(
            req.user,
            company_id,
            page,
            limit,
            search,
        );
        return { message: 'Employees fetched successfully', data: employees };
    }

    // GET Employee by Id
    @Get('/getEmployeeById/:employee_id')
    @ApiOperation({ summary: 'Get Employee By Id' })
    @ApiOkResponse({
        description: 'Employee fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getEmployeeById(
        @Request() req,
        @Param('employee_id') employee_id: string,
    ) {
        const employee = await this.employeeservice.getEmployeeById(
            employee_id,
            req.user,
        );
        return { message: 'Employee fetched successfully', data: employee };
    }

    // Delete Employee
    @Delete('/deleteEmployee/:employee_id')
    @ApiOperation({ summary: 'Delete Employee' })
    @ApiOkResponse({
        description: 'Employee deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteEmployee(@Request() req, @Param('employee_id') employee_id: string) {
        await this.employeeservice.deleteEmployee(
            employee_id,
            req.user,
        );
        return { message: 'Employee deleted successfully', data: true };
    }

    // Restore Employee
    @Delete('/restoreEmployee/:employee_id')
    @ApiOperation({ summary: 'Restore Employee' })
    @ApiOkResponse({
        description: 'Employee restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreEmployee(
        @Request() req,
        @Param('employee_id') employee_id: string,
    ) {
        await this.employeeservice.restoreEmployee(
            employee_id,
            req.user,
        );
        return { message: 'Employee restored successfully', data: true };
    }
}
