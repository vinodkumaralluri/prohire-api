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
import { CompanyDto } from './dto/company.dto';
import { CompanyService } from './company.service';

@Controller({
    path: 'company',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Company')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class CompanyController {
    constructor(private readonly companyservice: CompanyService) { }

    // Add Company
    @Post('/addCompany')
    @ApiOperation({ summary: 'Add Company' })
    @ApiOkResponse({
        description: 'Company added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addCompany(@Body() companyDto: CompanyDto, @Request() req) {
        const company = await this.companyservice.addCompany(
            companyDto,
            req.user.user_id,
        );
        if (company.status == true) {
            return { status: true, message: 'Company added successfully' };
        } else {
            throw new NotImplementedException(company.data);
        }
    }

    // Update Company
    @Put('/editCompany/:company_id')
    @ApiOperation({ summary: 'Update Company' })
    @ApiOkResponse({
        description: 'Company updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateCompany(
        @Request() req,
        @Param('company_id') company_id: string,
        @Body() companyDto: CompanyDto,
    ) {
        await this.companyservice.updateCompany(
            company_id,
            companyDto,
            req.user.user_id,
        );
        return { status: true, message: 'Company updated successfully', data: true };
    }

    // GET All Companies list
    @Get('/getCompanies')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Companies' })
    @ApiOkResponse({
        description: 'Companies fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getCompanies(
        @Param('id') id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const companies = await this.companyservice.getCompanies(
            id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Companies fetched successfully', data: companies };
    }

    // GET Company by Id
    @Get('/getCompanyById/:company_id')
    @ApiOperation({ summary: 'Get Company By Id' })
    @ApiOkResponse({
        description: 'Company fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getCompanyById(
        @Param('company_id') company_id: string,
    ) {
        const company = await this.companyservice.getCompanyById(
            company_id,
        );
        return { status: true, message: 'Company fetched successfully', data: company };
    }

    // Delete Company
    @Delete('/deleteCompany/:company_id')
    @ApiOperation({ summary: 'Delete Company' })
    @ApiOkResponse({
        description: 'Company deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteCompany(@Param('company_id') company_id: string) {
        await this.companyservice.deleteCompany(
            company_id,
        );
        return { message: 'Company deleted successfully', data: true };
    }

    // Restore Company
    @Delete('/restoreCompany/:company_id')
    @ApiOperation({ summary: 'Restore Company' })
    @ApiOkResponse({
        description: 'Company restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreCompany(
        @Param('company_id') company_id: string,
    ) {
        await this.companyservice.restoreCompany(
            company_id,
        );
        return { message: 'Company restored successfully', data: true };
    }

}
