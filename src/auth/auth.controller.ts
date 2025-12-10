import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { UserService } from '../modules/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService, private userService: UserService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // User info from Google
    const user = req.user;
  
    // Check if user exists
    let dbUser = await this.userService.findByEmail(user.email);
  
    if (!dbUser) {
      // Create new user
      dbUser = await this.userService.createUser({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: 'buyer',
      });
    }

    // Generate JWT token
    const payload = { 
      email: dbUser.email, 
      sub: dbUser.user_id,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    const token = this.jwtService.sign(payload);
  
    // Encode user for redirect
    const encodedUser = encodeURIComponent(JSON.stringify(dbUser));
  
    // Redirect to frontend
    return res.redirect(
      `${process.env.FRONTEND_URL}/index.html?token=${token}&user=${encodedUser}`
    );
  }


  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }
}