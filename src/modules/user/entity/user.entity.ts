import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {UUID} from "node:crypto";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    user_id: UUID;

    @Column({ type: 'varchar'})
    name: string;

    @Column({ type: 'varchar'})
    role: string;

    @Column({ type: 'varchar'})
    phonenumber: string;

    @Column({ type: 'varchar' })
    merch: string;
}