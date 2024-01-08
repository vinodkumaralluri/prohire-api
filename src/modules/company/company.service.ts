import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

// mongoose
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';

// Schemas
import { Company, CompanyDocument } from './schemas/company.schema';

// Dto
import { CompanyDto } from './dto/company.dto';

// Enum
import { AutoIncrementEnum } from '../auto-increment/auto-increment.enum';

// Service
import { AutoIncrementService } from '../auto-increment/auto-increment.service';

import { AppUtils } from '../../utils/app.utils';

@Injectable()
export class CompanyService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
        private autoIncrementService: AutoIncrementService,
    ) { }

    // Query Company
    async queryCompany(filter: any) {
        const company = await this.companyModel.findOne(filter).exec();
        return company;
    }

    // Add Company
    async addCompany(companyDto: CompanyDto, loggedInUser: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        // Check for Company
        const companycheck = await this.companyModel
            .findOne({ name: companyDto.name, status: 1 })
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
        company.name = companyDto.name;
        company.email = companyDto.email;
        company.phone_number = companyDto.phone_number;
        company.created_at = AppUtils.getIsoUtcMoment();
        company.updated_at = AppUtils.getIsoUtcMoment();
        company.created_by = loggedInUser;
        company.updated_by = loggedInUser;

        try {
            await this.companyModel.create([company], { transactionSession });
            await transactionSession.commitTransaction();
            return { status: true, data: 'success' };
        } catch (e) {
            await transactionSession.abortTransaction();
            return { status: false, data: e };
        } finally {
            await transactionSession.endSession();
        }
    }

    // GET All Companies list
    async getCompanies(
        id: string,
        page = 1,
        limit = AppUtils.DEFAULT_PAGE_LIMIT,
        search = '',
    ) {
        const params: any = {
            status: 1
        }
        if (search) {
            params.name = { $regex: search };
        }
        const count = await this.companyModel.count(params).exec();
        const list = await this.companyModel
            .find(params)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        return { list, count };
    }

    // GET Company by Id
    async getCompanyById(id: string) {
        const company = await this.companyModel
            .findOne({ company_id: id })
            .exec();
        return company;
    }

    // Update Company by Id
    async updateCompany(
        company_id: string,
        companyDto: CompanyDto,
        loggedInUser: string,
    ) {
        const company = await this.companyModel.findOne({ company_id }).exec();
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        company.name = companyDto.name;
        company.email = companyDto.email;
        company.phone_number = companyDto.phone_number;
        company.updated_at = AppUtils.getIsoUtcMoment();
        company.updated_by = loggedInUser;
        try {
            await this.companyModel.updateOne([{ company_id }, company], { transactionSession });
            await transactionSession.commitTransaction();
        } catch (e) {
            await transactionSession.abortTransaction();
        } finally {
            await transactionSession.endSession();
        }
    }

    // Delete Company by Id
    async deleteCompany(company_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const company = await this.companyModel.findOne({ company_id }).exec();
        if (!company) {
            throw new NotFoundException('Company not found');
        }
        try {
            await this.companyModel.updateOne([{ company_id }, { status: 0 }], { transactionSession });
            await transactionSession.commitTransaction();
            return;
        } catch (e) {
            await transactionSession.abortTransaction();
            return;
        } finally {
            await transactionSession.endSession();
        }
    }

    // Restore Company by Id
    async restoreCompany(company_id: string) {

        // starting session on mongoose default connection
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();

        const company = await this.companyModel.findOne({ company_id }).exec();
        if (!company) {
            throw new NotFoundException('Company not found');
        }
        try {
            await this.companyModel.updateOne([{ company_id }, { status: 1 }], { transactionSession });
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


