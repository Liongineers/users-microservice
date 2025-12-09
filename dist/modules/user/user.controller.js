"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const swagger_1 = require("@nestjs/swagger");
const link_builder_1 = require("../../common/link.builder");
const job_service_1 = require("../../common/job.service");
const node_fs_1 = require("node:fs");
const path = require("node:path");
const EXPORT_DIR = path.resolve(process.cwd(), 'exports');
let UserController = class UserController {
    constructor(userService, jobService) {
        this.userService = userService;
        this.jobService = jobService;
    }
    async getUsers(role, merch, page, limit) {
        const filters = { role, merch };
        const users = await this.userService.getUsers(filters, page, limit);
        return {
            _links: (0, link_builder_1.collectionLinks)(),
            total: users.total,
            page: users.page,
            limit: users.limit,
            data: users.data.map((u) => ({ ...u, _links: (0, link_builder_1.userLinks)(String(u.user_id)) })),
        };
    }
    async getUser(userId, req, res) {
        try {
            const user = await this.userService.getUser(userId);
            const etag = `"${new Date(user.updated_at).getTime()}"`;
            const clientEtag = req.headers['if-none-match'];
            if (clientEtag === etag) {
                res.status(304).send();
                return;
            }
            res.setHeader('ETag', etag);
            res.status(200).send({ ...user, _links: (0, link_builder_1.userLinks)(String(user.user_id)) });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                res.status(404).send({ statusCode: 404, message: 'User not found' });
            }
            else {
                res.status(500).send({ statusCode: 500, message: 'Internal server error' });
            }
        }
    }
    async createUser(createUserDto) {
        const u = await this.userService.createUser(createUserDto);
        return { ...u, _links: (0, link_builder_1.userLinks)(String(u.user_id)) };
    }
    async updateUser(userId, updateUserDto) {
        const u = await this.userService.updateUser(userId, updateUserDto);
        return { ...u, _links: (0, link_builder_1.userLinks)(String(u.user_id)) };
    }
    deleteUser(userId) {
        return this.userService.deleteUser(userId);
    }
    async startExport(userId) {
        const job = this.jobService.create('user-export', { userId });
        void this.jobService.run(job.id, async () => {
            await this.userService.writeUserCsv(userId, EXPORT_DIR);
            return { resultPath: `/users/${userId}/export/result` };
        });
        return {
            jobId: job.id,
            status: job.status,
            _links: (0, link_builder_1.operationLinks)(job.id, userId),
        };
    }
    async getOperation(jobId) {
        const job = this.jobService.get(jobId);
        if (!job) {
            throw new common_1.NotFoundException('Operation not found.');
        }
        const userId = job.meta?.userId;
        return {
            jobId: job.id,
            status: job.status,
            _links: (0, link_builder_1.operationLinks)(job.id, userId, job.resultPath),
            error: job.error ?? undefined,
        };
    }
    async exportResult(userId) {
        const filePath = path.join(EXPORT_DIR, `${userId}.csv`);
        if (!(0, node_fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Export not ready (or not found).');
        }
        const stream = (0, node_fs_1.createReadStream)(filePath);
        return new common_1.StreamableFile(stream, {
            type: 'text/csv',
            disposition: `attachment; filename="user-${userId}.csv"`,
        });
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (with filtering and pagination)' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, description: 'Filter by user role' }),
    (0, swagger_1.ApiQuery)({ name: 'merch', required: false, description: 'Filter by merch' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated list of users returned.',
    }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('merch')),
    __param(2, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a user by id (with eTag support)' }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        required: true,
        description: 'User ID (UUID)',
        schema: { type: 'string', format: 'uuid' },
        example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User returned.',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('create_user'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    (0, swagger_1.ApiBody)({ description: 'User payload', type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'User created.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing user' }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
    }),
    (0, swagger_1.ApiBody)({ description: 'Fields to update', type: update_user_dto_1.UpdateUserDto }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User updated.',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user' }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User deleted',
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)(':userId/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Start an async user export' }),
    (0, swagger_1.ApiParam)({ name: 'userId', schema: { type: 'string', format: 'uuid' } }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Accepted; poll the operation link for status.',
    }),
    (0, common_1.HttpCode)(202),
    (0, common_1.Header)('Retry-After', '2'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "startExport", null);
__decorate([
    (0, common_1.Get)('operations/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Poll async operation status' }),
    (0, swagger_1.ApiParam)({ name: 'jobId', schema: { type: 'string', format: 'uuid' } }),
    (0, swagger_1.ApiOkResponse)({ description: 'Current job status and links.' }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getOperation", null);
__decorate([
    (0, common_1.Get)(':userId/export/result'),
    (0, swagger_1.ApiOperation)({ summary: 'Download CSV export for this user' }),
    (0, swagger_1.ApiOkResponse)({ description: 'CSV stream.' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "exportResult", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        job_service_1.JobService])
], UserController);
//# sourceMappingURL=user.controller.js.map