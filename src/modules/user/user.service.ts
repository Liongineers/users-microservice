import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {Users} from "./entity/user.entity";
import {Repository} from "typeorm";
import {UUID} from "node:crypto";
import {UpdateUserDto} from "./dto/update-user.dto";

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
}
