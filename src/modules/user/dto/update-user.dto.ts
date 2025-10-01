import {IsNotEmpty, IsOptional, IsPhoneNumber, IsString} from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string | null;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    role?: string | null;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    phoneNumber?: string | null;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    merch?: string | null;
}