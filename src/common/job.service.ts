import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed';
export interface JobRecord {
    id: string;
    type: string;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    resultPath?: string;
    error?: string;
    meta?: Record<string, unknown>;
}

@Injectable()
export class JobService {
    private jobs = new Map<string, JobRecord>();

    create(type: string, meta?: Record<string, unknown>): JobRecord {
        const id = randomUUID();
        const now = new Date().toISOString();
        const job: JobRecord = { id, type, status: 'pending', createdAt: now, updatedAt: now, meta };
        this.jobs.set(id, job);
        return job;
    }

    /** Run a job by executing the given async task and update its status. */
    async run(jobId: string, task: () => Promise<{ resultPath?: string }>) {
        const j = this.jobs.get(jobId);
        if (!j) return;
        j.status = 'running'; j.updatedAt = new Date().toISOString(); this.jobs.set(jobId, j);

        try {
            const { resultPath } = await task();
            const jj = this.jobs.get(jobId);
            if (!jj) return;
            jj.status = 'succeeded';
            jj.resultPath = resultPath;
            jj.updatedAt = new Date().toISOString();
            this.jobs.set(jobId, jj);
        } catch (err: any) {
            const jj = this.jobs.get(jobId);
            if (!jj) return;
            jj.status = 'failed';
            jj.error = String(err?.message ?? err);
            jj.updatedAt = new Date().toISOString();
            this.jobs.set(jobId, jj);
        }
    }

    get(jobId: string) { return this.jobs.get(jobId); }
}
