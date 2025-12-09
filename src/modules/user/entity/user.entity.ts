import {Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {UUID} from "node:crypto";

@Entity()
export class Users {
    @PrimaryGeneratedColumn('uuid')
    user_id: UUID;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'varchar'})
    name: string;

    @Column({ type: 'varchar'})
    role: string;

    @Column({ type: 'varchar', nullable: true })
    phonenumber: string | null;

    @Column({ type: 'varchar', nullable: true })
    merch: string | null;

    @UpdateDateColumn()
    updated_at: Date;
}