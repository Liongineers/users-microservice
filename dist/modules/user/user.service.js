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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entity/user.entity");
const typeorm_2 = require("typeorm");
const path = require("node:path");
const fs = require("node:fs/promises");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getUsers(filters, page, limit) {
        const where = {};
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
    async getUser(userId) {
        const user = await this.userRepository.findOne({ where: { user_id: userId } });
        if (user) {
            return user;
        }
        else
            throw new common_1.NotFoundException('User not found');
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async createUser(createUserDto) {
        const user = new user_entity_1.Users();
        user.email = createUserDto.email;
        user.name = createUserDto.name;
        user.role = createUserDto.role;
        user.phonenumber = createUserDto.phoneNumber ?? null;
        user.merch = createUserDto.merch ?? null;
        return this.userRepository.save(user);
    }
    async updateUser(userId, updateUserDto) {
        const user = await this.getUser(userId);
        user.email = updateUserDto.email ? updateUserDto.email : user.email;
        user.name = updateUserDto.name ? updateUserDto.name : user.name;
        user.role = updateUserDto.role ? updateUserDto.role : user.role;
        user.phonenumber = updateUserDto.phoneNumber ? updateUserDto.phoneNumber : user.phonenumber;
        user.merch = updateUserDto.merch ? updateUserDto.merch : user.merch;
        user.user_id = userId;
        return this.userRepository.save(user);
    }
    async deleteUser(userId) {
        return { deleted: (await this.userRepository.delete({ user_id: userId })).affected };
    }
    async writeUserCsv(userId, exportDir) {
        await fs.mkdir(exportDir, { recursive: true });
        const user = await this.getUser(userId);
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
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map