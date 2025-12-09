import { StreamableFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UUID } from 'node:crypto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { JobService } from "../../common/job.service";
export declare class UserController {
    private userService;
    private jobService;
    constructor(userService: UserService, jobService: JobService);
    getUsers(role?: string, merch?: string, page?: number, limit?: number): Promise<{
        _links: import("../../common/link.builder").Links;
        total: number;
        page: number;
        limit: number;
        data: {
            _links: import("../../common/link.builder").Links;
            user_id: UUID;
            email: string;
            name: string;
            role: string;
            phonenumber: string | null;
            merch: string | null;
            updated_at: Date;
        }[];
    }>;
    getUser(userId: UUID, req: Request, res: Response): Promise<void>;
    createUser(createUserDto: CreateUserDto): Promise<{
        _links: import("../../common/link.builder").Links;
        user_id: UUID;
        email: string;
        name: string;
        role: string;
        phonenumber: string | null;
        merch: string | null;
        updated_at: Date;
    }>;
    updateUser(userId: UUID, updateUserDto: UpdateUserDto): Promise<{
        _links: import("../../common/link.builder").Links;
        user_id: UUID;
        email: string;
        name: string;
        role: string;
        phonenumber: string | null;
        merch: string | null;
        updated_at: Date;
    }>;
    deleteUser(userId: UUID): Promise<{
        deleted?: number | null;
    }>;
    startExport(userId: string): Promise<{
        jobId: string;
        status: import("../../common/job.service").JobStatus;
        _links: import("../../common/link.builder").Links;
    }>;
    getOperation(jobId: string): Promise<{
        jobId: string;
        status: import("../../common/job.service").JobStatus;
        _links: import("../../common/link.builder").Links;
        error: string | undefined;
    }>;
    exportResult(userId: string): Promise<StreamableFile>;
}
