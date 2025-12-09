"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
let JobService = class JobService {
    constructor() {
        this.jobs = new Map();
    }
    create(type, meta) {
        const id = (0, node_crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const job = { id, type, status: 'pending', createdAt: now, updatedAt: now, meta };
        this.jobs.set(id, job);
        return job;
    }
    async run(jobId, task) {
        const j = this.jobs.get(jobId);
        if (!j)
            return;
        j.status = 'running';
        j.updatedAt = new Date().toISOString();
        this.jobs.set(jobId, j);
        try {
            const { resultPath } = await task();
            const jj = this.jobs.get(jobId);
            if (!jj)
                return;
            jj.status = 'succeeded';
            jj.resultPath = resultPath;
            jj.updatedAt = new Date().toISOString();
            this.jobs.set(jobId, jj);
        }
        catch (err) {
            const jj = this.jobs.get(jobId);
            if (!jj)
                return;
            jj.status = 'failed';
            jj.error = String(err?.message ?? err);
            jj.updatedAt = new Date().toISOString();
            this.jobs.set(jobId, jj);
        }
    }
    get(jobId) { return this.jobs.get(jobId); }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, common_1.Injectable)()
], JobService);
//# sourceMappingURL=job.service.js.map