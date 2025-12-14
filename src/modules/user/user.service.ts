import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Users} from "./entity/user.entity";
import {Repository, FindOptionsWhere} from "typeorm";
import {UUID} from "node:crypto";
import {UpdateUserDto} from "./dto/update-user.dto";
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { PubSub } from '@google-cloud/pubsub'; 


const pubSubClient = new PubSub({
    projectId: process.env.GCP_PROJECT_ID || 'cloud-computing-473717',
});
const USER_CREATED_TOPIC = 'user-created-event';

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


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    ) {}
    
    // NEW: Private helper method to handle the asynchronous publishing action
    private async publishNewUserEvent(user: Users): Promise<void> {
        try {
            // Define the minimal payload to decouple services
            const payload = {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                timestamp: new Date().toISOString(),
                // Add any other crucial fields the Cloud Function needs
            };
            
            // Pub/Sub messages must be sent as a Buffer/byte array
            const dataBuffer = Buffer.from(JSON.stringify(payload));
            
            await pubSubClient.topic(USER_CREATED_TOPIC).publishMessage({ data: dataBuffer });
            
            console.log(`[Pub/Sub] Event published to ${USER_CREATED_TOPIC} for user ${user.user_id}`);
        } catch (error) {
            // CRITICAL: Log the error but DO NOT re-throw or fail the main API call.
            // The event is a non-essential side-effect.
            console.error(`[Pub/Sub ERROR] Failed to publish message: ${error.message}`);
        }
    }

    // getUsers method to handle filtering and pagination
    public async getUsers(
        filters: UserFilters,
        page: number,
        limit: number
    ): Promise<PaginatedUserResult> {
        

        const where: FindOptionsWhere<Users> = {};
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.merch) {
            where.merch = filters.merch;
        }

        const skip = (page - 1) * limit;

        const [data, total] = await this.userRepository.findAndCount({
            where,      
            skip: skip, 
            take: limit 
        });

        return {
            data,
            total,
            page,
            limit
        };
    }

    public async getUser(userId: UUID): Promise<Users> {
        const user = await this.userRepository.findOne({where: {user_id: userId}});
        if (user) {
            return user;
        }
        else throw new NotFoundException('User not found');
    }

    public async findByEmail(email: string): Promise<Users | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    public async createUser(createUserDto: CreateUserDto): Promise<Users> {
        const user: Users = new Users();
        user.email = createUserDto.email;
        user.name = createUserDto.name;
        user.role = createUserDto.role;
        user.phonenumber = createUserDto.phoneNumber ?? null;
        user.merch = createUserDto.merch ?? null;

        // Save the user to the database (synchronous, primary action)
        const savedUser = await this.userRepository.save(user);

        // Publish the event
        // We use savedUser to ensure we send the final user_id assigned by the DB.
        this.publishNewUserEvent(savedUser); 

        return savedUser;
    }

    public async updateUser(userId: UUID, dto: UpdateUserDto): Promise<Users> {
        console.log("Before update");
	const patch: Partial<Users> = {};

        if (dto.email !== null) patch.email = dto.email;
        if (dto.name !== null) patch.name = dto.name;
        if (dto.role !== null) patch.role = dto.role;
        if (dto.phoneNumber !== null) patch.phonenumber = dto.phoneNumber;
        if (dto.merch !== null) patch.merch = dto.merch;
	console.log("Right before");
        const result = await this.userRepository.update({ user_id: userId }, patch);
        if (!result.affected) throw new NotFoundException('User not found');
	console.log("After");
        return this.getUser(userId);
    }

    public async deleteUser(userId: UUID): Promise<{deleted?: number|null}> {
        return {deleted: (await this.userRepository.delete({user_id: userId})).affected};
    }

    async writeUserCsv(userId: string, exportDir: string) {
        await fs.mkdir(exportDir, { recursive: true });

        const user = await this.getUser(userId as any);

        const csv = [
            'user_id,name,role,phonenumber,merch',
            [
                user.user_id,
                JSON.stringify(user.name ?? ''),
                JSON.stringify(user.role ?? ''),
                JSON.stringify(user.phonenumber ?? ''),
                JSON.stringify(user.merch ?? ''),
            ].join(','),
        ].join('\n');

        const filePath = path.join(exportDir, `${userId}.csv`);
        await fs.writeFile(filePath, csv, { encoding: 'utf8' });
    }
}
