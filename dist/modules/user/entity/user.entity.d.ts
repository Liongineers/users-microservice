import { UUID } from "node:crypto";
export declare class Users {
    user_id: UUID;
    email: string;
    name: string;
    role: string;
    phonenumber: string | null;
    merch: string | null;
    updated_at: Date;
}
