import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Full name of the user',
        example: 'Ada Lovelace',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Role or access level for the user',
        example: 'seller',
    })
    @IsNotEmpty()
    @IsString()
    role: string;

    @ApiProperty({
        description: 'Phone number in E.164 format (country code + number)',
        example: '+14155550133',
    })
    @IsPhoneNumber('US')
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({
        description: 'Merchandise preference or identifier',
        example: 'chair',
    })
    @IsNotEmpty()
    @IsString()
    merch: string;
}
