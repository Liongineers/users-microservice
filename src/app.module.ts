import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { databaseConfiguration } from './config/database';
import { UserModule } from './modules/user/user.module';
import {JobService} from "./common/job.service";

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true,
          load: config,
      }),
      TypeOrmModule.forRoot(databaseConfiguration()),
      UserModule,
  ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}