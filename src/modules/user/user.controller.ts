import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
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
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiOkResponse({
        description: 'List of users returned.',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    user_id: { type: 'string', format: 'uuid', example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a' },
                    name: { type: 'string', example: 'Ada Lovelace' },
                    role: { type: 'string', example: 'seller' },
                    phonenumber: { type: 'string', example: '1234567890' },
                    merch: { type: 'string', example: 'chair' },
                },
            },
        },
    })
    getUsers() {
        return this.userService.getUsers();
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
        description: 'User returned.',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', format: 'uuid', example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a' },
                name: { type: 'string', example: 'Ada Lovelace' },
                role: { type: 'string', example: 'seller' },
                phonenumber: { type: 'string', example: '1234567890' },
                merch: { type: 'string', example: 'chair' },
            },
        },
    })
    getUser(@Param('userId') userId: UUID) {
        return this.userService.getUser(userId);
    }

    @Post('create_user')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({ description: 'User payload', type: CreateUserDto })
    @ApiCreatedResponse({
        description: 'User created.',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', format: 'uuid', example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a' },
                name: { type: 'string', example: 'Ada Lovelace' },
                role: { type: 'string', example: 'seller' },
                phonenumber: { type: 'string', example: '1234567890' },
                merch: { type: 'string', example: 'chair' },
            },
        },
    })
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
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
    @ApiOkResponse({
        description: 'User updated.',
        schema: {
            type: 'object',
            properties: {
                user_id: { type: 'string', format: 'uuid', example: '3f6a71a4-2f94-4b3e-9f0c-6a6e2f5b3c1a' },
                name: { type: 'string', example: 'Ada Lovelace' },
                role: { type: 'string', example: 'seller' },
                phonenumber: { type: 'string', example: '1234567890' },
                merch: { type: 'string', example: 'chair' },
            },
        },
    })
    updateUser(@Param('userId') userId: UUID, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(userId, updateUserDto);
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
            properties: {
                deleted: { type: 'number', example: '1' },
            },
        }
    })
    deleteUser(@Param('userId') userId: UUID) {
        return this.userService.deleteUser(userId);
    }
}