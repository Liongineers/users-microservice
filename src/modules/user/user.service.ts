import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Users} from "./entity/user.entity";
import {Repository} from "typeorm";
import {UUID} from "node:crypto";
import {UpdateUserDto} from "./dto/update-user.dto";
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    ) {}

    public async getUsers(): Promise<Users[]> {
        return this.userRepository.find();
    }

    public async getUser(userId: UUID): Promise<Users> {
        const user = await this.userRepository.findOne({where: {user_id: userId}});
        if (user) {
            return user;
        }
        else throw new NotFoundException('User not found');
    }

    public async createUser(createUserDto: CreateUserDto): Promise<Users> {
        const user: Users = new Users();
        user.name = createUserDto.name;
        user.role = createUserDto.role;
        user.phonenumber = createUserDto.phoneNumber;
        user.merch = createUserDto.merch;
        return this.userRepository.save(user);
    }

    public async updateUser(userId: UUID, updateUserDto: UpdateUserDto): Promise<Users> {
        const user = await this.getUser(userId);
        user.name = updateUserDto.name ? updateUserDto.name : user.name;
        user.role = updateUserDto.role ? updateUserDto.role : user.role;
        user.phonenumber = updateUserDto.phoneNumber ? updateUserDto.phoneNumber : user.phonenumber;
        user.merch = updateUserDto.merch ? updateUserDto.merch : user.merch;
        user.user_id = userId;
        return this.userRepository.save(user);
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
