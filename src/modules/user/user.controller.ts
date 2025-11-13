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
    NotFoundException
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

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

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
    getUsers(
        // Use @Query() to capture URL query parameters
        @Query('role') role?: string,
        @Query('merch') merch?: string,
        // Use pipes to set default values and parse to integers
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    ) {
        // Pass the captured values to the service
        const filters = { role, merch };
        return this.userService.getUsers(filters, page!, limit!);
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
            res.status(200).send(user);

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
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
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
    updateUser(@Param('userId') userId: UUID, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(userId, updateUserDto);
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
}