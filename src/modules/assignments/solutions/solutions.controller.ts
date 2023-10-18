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
import { SolutionStatus } from 'src/enums/solution-status.enum';
import { TransformInterceptor } from '../../../core/transform.interceptor';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SolutionDto } from '../dto/solution.dto';
import { SolutionsService } from './solutions.service';

@Controller({
    path: 'solutions',
    version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiTags('Solutions')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class SolutionsController {
    constructor(private readonly solutionservice: SolutionsService) { }

    // Add Solution to an Assignment
    @Post('/addSolution')
    @ApiOperation({ summary: 'Add Solution to an Assignment' })
    @ApiOkResponse({
        description: 'Solution to an Assignment added successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    async addSolution(@Body() solutionDto: SolutionDto, @Request() req) {
        const solution = await this.solutionservice.addSolution(
            solutionDto,
            req.user.user_id,
        );
        if (solution.status == true) {
            return { status: true, message: 'Solution to an Assignment added successfully' };
        } else {
            throw new NotImplementedException(solution.data);
        }
    }

    // Update Solution
    @Put('/editSolution/:solution_id')
    @ApiOperation({ summary: 'Update Solution' })
    @ApiOkResponse({
        description: 'Solution updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateSolution(
        @Request() req,
        @Param('solution_id') solution_id: string,
        @Body() solutionDto: SolutionDto,
    ) {
        await this.solutionservice.updateSolution(
            solution_id,
            solutionDto,
            req.user.user_id,
        );
        return { status: true, message: 'Solution updated successfully', data: true };
    }

    // GET All Solutions of an Assignment
    @Get('/getSolutions/:assignment_id')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOperation({ summary: 'Get Solutions of an Assignment' })
    @ApiOkResponse({
        description: 'Solutions of an Assignment fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getSolutions(
        @Param('assignment_id') assignment_id: string,
        @Query('page') page,
        @Query('limit') limit,
        @Query('search') search,
    ) {
        const solutions = await this.solutionservice.getSolutions(
            assignment_id,
            page,
            limit,
            search,
        );
        return { status: true, message: 'Solutions fetched successfully', data: solutions };
    }

    // GET Solution by Id
    @Get('/getSolutionById/:solution_id')
    @ApiOperation({ summary: 'Get Solution By Id' })
    @ApiOkResponse({
        description: 'Solution fetched successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async getSolutionById(
        @Param('solution_id') solution_id: string,
    ) {
        const solution = await this.solutionservice.getSolutionById(
            solution_id,
        );
        return { status: true, message: 'Solution fetched successfully', data: solution };
    }

    // Update Solution Status
    @Put('/updateSolutionStatus/:solution_status/:solution_id')
    @ApiOperation({ summary: 'Update Solution Status' })
    @ApiOkResponse({
        description: 'Solution Status updated successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async updateSolutionStatus(
        @Request() req,
        @Param('solution_status') solution_status: SolutionStatus,
        @Param('solution_id') solution_id: string,
    ) {
        await this.solutionservice.updateSolutionStatus(
            solution_status,
            solution_id,
            req.user.user_id,
        );
        return { status: true, message: 'Solution Status updated successfully', data: true };
    }

    // Delete Solution
    @Delete('/deleteSolution/:solution_id')
    @ApiOperation({ summary: 'Delete Solution' })
    @ApiOkResponse({
        description: 'Solution deleted successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async deleteSolution(@Param('solution_id') solution_id: string) {
        await this.solutionservice.deleteSolution(
            solution_id,
        );
        return { message: 'Solution deleted successfully', data: true };
    }

    // Restore Solution
    @Delete('/restoreSolution/:solution_id')
    @ApiOperation({ summary: 'Restore Solution' })
    @ApiOkResponse({
        description: 'Solution restored successfully',
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid username or password',
    })
    @ApiInternalServerErrorResponse({
        description: 'Technical error while processing',
    })
    @UseGuards(JwtAuthGuard)
    async restoreSolution(
        @Param('solution_id') solution_id: string,
    ) {
        await this.solutionservice.restoreSolution(
            solution_id,
        );
        return { message: 'Solution restored successfully', data: true };
    }

}


