import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { UserService } from '../modules/user/user.service';
export declare class AuthController {
    private jwtService;
    private userService;
    constructor(jwtService: JwtService, userService: UserService);
    googleAuth(req: Request): Promise<void>;
    googleAuthRedirect(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: any): any;
}
