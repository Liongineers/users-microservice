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
export declare class JobService {
    private jobs;
    create(type: string, meta?: Record<string, unknown>): JobRecord;
    run(jobId: string, task: () => Promise<{
        resultPath?: string;
    }>): Promise<void>;
    get(jobId: string): JobRecord | undefined;
}
