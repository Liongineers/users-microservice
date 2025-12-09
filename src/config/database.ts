import { DataSourceOptions } from "typeorm";
import {Users} from "../modules/user/entity/user.entity";

export const databaseConfiguration = (): Partial<DataSourceOptions> => ({
    type: process.env.DATABASE_TYPE as any,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT!),
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    entities: [Users],
    synchronize: false,
})