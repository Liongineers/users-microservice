import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    ParseIntPipe,
    DefaultValuePipe,
    NotFoundException,
    HttpCode,
    Header,
    StreamableFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UUID } from 'node:crypto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import {
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import {collectionLinks, operationLinks, userLinks} from "../../common/link.builder";
import {JobService} from "../../common/job.service";
import { createReadStream, existsSync } from 'node:fs';
import * as path from 'node:path';

const EXPORT_DIR = path.resolve(process.cwd(), 'exports');

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private userService: UserService,
                private jobService: JobService,) {}

    // getUsers to implement Pagination and Query Params
    @Get()
    @ApiOperation({ summary: 'Get all users (with filtering and pagination)' })
    @ApiQuery({ name: 'role', required: false, description: 'Filter by user role' })
    @ApiQuery({ name: 'merch', required: false, description: 'Filter by merch' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 })
    @ApiOkResponse({
        description: 'Paginated list of users returned.',
    })
    async getUsers(
        // Use @Query() to capture URL query parameters
        @Query('role') role?: string,
        @Query('merch') merch?: string,
        // Use pipes to set default values and parse to integers
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    ) {
        // Pass the captured values to the service
        const filters = { role, merch };
        const users = await this.userService.getUsers(filters, page!, limit!);
        return {
            _links: collectionLinks(),
            total: users.total,
            page: users.page,
            limit: users.limit,
            data: users.data.map((u) => ({ ...u, _links: userLinks(String(u.user_id)) })),
        };
    }

    // getUser to implement eTag processing
    @Get(':userId')
    @ApiOperation({ summary: 'Get a user by id (with eTag support)' })
    @ApiParam({
        name: 'userId',
        required: true,
        description: 'User ID (UUID)',
        schema: { type: 'string', format: 'uuid' },
        example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a',
    })
    @ApiOkResponse({
        description: 'User returned.',
    })
    async getUser(
        @Param('userId') userId: UUID,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            // 1. Get the user data from the service
            const user = await this.userService.getUser(userId);

            // Generate the eTag from the user's updated_at timestamp
            // The quotes are part of the standard eTag format
            const etag = `"${new Date(user.updated_at).getTime()}"`;

            // 3. Check the client's 'If-None-Match' header
            const clientEtag = req.headers['if-none-match'];

            if (clientEtag === etag) {
                // If they match, send a 304 Not Modified
                res.status(304).send();
                return; // Stop processing
            }

            // If they don't match, set the ETag header and send the full 200 OK response
            res.setHeader('ETag', etag);
            res.status(200).send({ ...user, _links: userLinks(String(user.user_id)) });

        } catch (error) {
            if (error instanceof NotFoundException) {
                res.status(404).send({ statusCode: 404, message: 'User not found' });
            } else {
                res.status(500).send({ statusCode: 500, message: 'Internal server error' });
            }
        }
    }


    @Post('create_user')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ description: 'User payload', type: CreateUserDto })
    @ApiCreatedResponse({
        description: 'User created.',
    })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const u = await this.userService.createUser(createUserDto);
        return { ...u, _links: userLinks(String(u.user_id)) };
    }

    @Patch(':userId')
    @ApiOperation({ summary: 'Update an existing user' })
    @ApiParam({
        name: 'userId',
    })
    @ApiBody({ description: 'Fields to update', type: UpdateUserDto })
    @ApiOkResponse({
        description: 'User updated.',
    })
    async updateUser(@Param('userId') userId: UUID, @Body() updateUserDto: UpdateUserDto, @Res() res: Response,) {
        const u = await this.userService.updateUser(userId, updateUserDto);
        return res.status(200).send({ ...u, _links: userLinks(String(u.user_id)) });
    }

    @Delete(':userId')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({
        name: 'userId',
    })
    @ApiOkResponse({
        description: 'User deleted',
    })
    deleteUser(@Param('userId') userId: UUID) {
        return this.userService.deleteUser(userId);
    }

    @Post(':userId/export')
    @ApiOperation({ summary: 'Start an async user export' })
    @ApiParam({ name: 'userId', schema: { type: 'string', format: 'uuid' } })
    @ApiOkResponse({
        description: 'Accepted; poll the operation link for status.',
    })
    @HttpCode(202)
    @Header('Retry-After', '2')
    async startExport(@Param('userId') userId: string) {
        const job = this.jobService.create('user-export', { userId });

        void this.jobService.run(job.id, async () => {
            await this.userService.writeUserCsv(userId, EXPORT_DIR);
            return { resultPath: `/users/${userId}/export/result` };
        });

        return {
            jobId: job.id,
            status: job.status, // "pending"
            _links: operationLinks(job.id, userId),
        };
    }

    @Get('operations/:jobId')
    @ApiOperation({ summary: 'Poll async operation status' })
    @ApiParam({ name: 'jobId', schema: { type: 'string', format: 'uuid' } })
    @ApiOkResponse({ description: 'Current job status and links.' })
    async getOperation(@Param('jobId') jobId: string) {
        const job = this.jobService.get(jobId);
        if (!job) {
            throw new NotFoundException('Operation not found.');
        }
        const userId = (job as any).meta?.userId as string | undefined;
        return {
            jobId: job.id,
            status: job.status,
            _links: operationLinks(job.id, userId, job.resultPath),
            error: job.error ?? undefined,
        };
    }

    @Get(':userId/export/result')
    @ApiOperation({ summary: 'Download CSV export for this user' })
    @ApiOkResponse({ description: 'CSV stream.' })
    async exportResult(@Param('userId') userId: string) {
        const filePath = path.join(EXPORT_DIR, `${userId}.csv`);
        if (!existsSync(filePath)) {
            throw new NotFoundException('Export not ready (or not found).');
        }
        const stream = createReadStream(filePath);
        return new StreamableFile(stream, {
            type: 'text/csv',
            disposition: `attachment; filename="user-${userId}.csv"`,
        });
    }
}