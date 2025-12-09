import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../modules/user/user.module';  // Add this import

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,  // Add this line
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}