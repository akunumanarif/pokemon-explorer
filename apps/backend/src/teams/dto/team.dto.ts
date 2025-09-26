import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'My Elite Four Team' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A team built for competitive battles', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateTeamDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class AddTeamMemberDto {
  @ApiProperty({ example: 25, description: 'Pokemon ID' })
  @IsNumber()
  pokemonId: number;

  @ApiProperty({ 
    example: 1, 
    minimum: 1, 
    maximum: 6, 
    required: false,
    description: 'Position in team (1-6). If not provided, will auto-assign to first available slot.' 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  position?: number;

  @ApiProperty({ example: 'Pikachu', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;
}