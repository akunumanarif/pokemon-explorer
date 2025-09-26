import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'trainer@pokemon.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'pokemon_trainer' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Ash', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Ketchum', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'trainer@pokemon.com or pokemon_trainer' })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}