import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({
        description: 'Full name of the user',
        example: 'Ada Lovelace',
        nullable: true,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string | null;

    @ApiPropertyOptional({
        description: 'Role or access level for the user',
        example: 'seller',
        nullable: true,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    role?: string | null;

    @ApiPropertyOptional({
        description: 'Phone number in E.164 format (country code + number)',
        example: '+14155550133',
        nullable: true,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsPhoneNumber('US')
    phoneNumber?: string | null;

    @ApiPropertyOptional({
        description: 'Merchandise preference or identifier',
        example: 'chair',
        nullable: true,
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    merch?: string | null;
}