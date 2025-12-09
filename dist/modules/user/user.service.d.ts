import { CreateUserDto } from "./dto/create-user.dto";
import { Users } from "./entity/user.entity";
import { Repository } from "typeorm";
import { UUID } from "node:crypto";
import { UpdateUserDto } from "./dto/update-user.dto";
export interface UserFilters {
    role?: string;
    merch?: string;
}
export interface PaginatedUserResult {
    data: Users[];
    total: number;
    page: number;
    limit: number;
}
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<Users>);
    getUsers(filters: UserFilters, page: number, limit: number): Promise<PaginatedUserResult>;
    getUser(userId: UUID): Promise<Users>;
    findByEmail(email: string): Promise<Users | null>;
    createUser(createUserDto: CreateUserDto): Promise<Users>;
    updateUser(userId: UUID, updateUserDto: UpdateUserDto): Promise<Users>;
    deleteUser(userId: UUID): Promise<{
        deleted?: number | null;
    }>;
    writeUserCsv(userId: string, exportDir: string): Promise<void>;
}
