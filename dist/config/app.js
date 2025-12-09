"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfiguration = void 0;
const appConfiguration = () => ({ port: parseInt(process.env.PORT, 10) || 8080, });
exports.appConfiguration = appConfiguration;
//# sourceMappingURL=app.js.map