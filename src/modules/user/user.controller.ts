import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import { UserService } from './user.service';
import {CreateUserDto} from "./dto/create-user.dto";
import {UUID} from "node:crypto";
import {UpdateUserDto} from "./dto/update-user.dto";

@Controller('users')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @Get()
    getUsers(){
        return this.userService.getUsers();
    }

    @Get(':userId')
    getUser(@Param('userId') userId: UUID) {
        return this.userService.getUser(userId);
    }

    @Post('create_user')
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    @Patch(':userId')
    updateUser(@Param('userId') userId: UUID, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(userId, updateUserDto);
    }

    @Delete(':userId')
    deleteUser(@Param('userId') userId: UUID) {
        return this.userService.deleteUser(userId);
    }
}