import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
    Post,
    StreamableFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UUID } from 'node:crypto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JobService } from '../../common/job.service';
import { collectionLinks, operationLinks, userLinks } from '../../common/link.builder';
import { createReadStream, existsSync } from 'node:fs';
import * as path from 'node:path';

const EXPORT_DIR = path.resolve(process.cwd(), 'exports');

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private jobService: JobService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiOkResponse({
        description: 'List of users with relative links.',
        schema: {
            type: 'object',
            properties: {
                _links: { type: 'object' },
                count: { type: 'number', example: 2 },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            user_id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            role: { type: 'string' },
                            phonenumber: { type: 'string' },
                            merch: { type: 'string' },
                            _links: { type: 'object' },
                        },
                    },
                },
            },
        },
    })
    async getUsers() {
        const users = await this.userService.getUsers();
        return {
            _links: collectionLinks(),
            count: users.length,
            items: users.map((u) => ({ ...u, _links: userLinks(String(u.user_id)) })),
        };
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiParam({
        name: 'userId',
        required: true,
        description: 'User ID (UUID)',
        schema: { type: 'string', format: 'uuid' },
        example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a',
    })
    @ApiOkResponse({
        description: 'User returned with relative links.',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                role: { type: 'string' },
                phonenumber: { type: 'string' },
                merch: { type: 'string' },
                _links: { type: 'object' },
            },
        },
    })
    async getUser(@Param('userId') userId: UUID) {
        const u = await this.userService.getUser(userId);
        return { ...u, _links: userLinks(String(u.user_id)) };
    }

    @Post('create_user')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ description: 'User payload', type: CreateUserDto })
    @ApiCreatedResponse({
        description: 'User created with relative links.',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                role: { type: 'string' },
                phonenumber: { type: 'string' },
                merch: { type: 'string' },
                _links: { type: 'object' },
            },
        },
    })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const u = await this.userService.createUser(createUserDto);
        return { ...u, _links: userLinks(String(u.user_id)) };
    }

    @Patch(':userId')
    @ApiOperation({ summary: 'Update an existing user' })
    @ApiParam({
        name: 'userId',
        required: true,
        description: 'User ID (UUID)',
        schema: { type: 'string', format: 'uuid' },
        example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a',
    })
    @ApiBody({ description: 'Fields to update', type: UpdateUserDto })
    @ApiOkResponse({ description: 'User updated with relative links.' })
    async updateUser(@Param('userId') userId: UUID, @Body() updateUserDto: UpdateUserDto) {
        const u = await this.userService.updateUser(userId, updateUserDto);
        return { ...u, _links: userLinks(String(u.user_id)) };
    }

    @Delete(':userId')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({
        name: 'userId',
        required: true,
        description: 'User ID (UUID)',
        schema: { type: 'string', format: 'uuid' },
        example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a',
    })
    @ApiOkResponse({
        description: 'User deleted',
        schema: {
            type: 'object',
            properties: { deleted: { type: 'number', example: 1 } },
        },
    })
    deleteUser(@Param('userId') userId: UUID) {
        return this.userService.deleteUser(userId);
    }

    @Post(':userId/export')
    @ApiOperation({ summary: 'Start an async user export' })
    @ApiParam({ name: 'userId', schema: { type: 'string', format: 'uuid' } })
    @ApiResponse({
        status: 202,
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
