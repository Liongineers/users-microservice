"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfiguration = void 0;
const user_entity_1 = require("../modules/user/entity/user.entity");
const databaseConfiguration = () => ({
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    entities: [user_entity_1.Users],
    synchronize: false,
});
exports.databaseConfiguration = databaseConfiguration;
//# sourceMappingURL=database.js.map