import { Controller, Get, Post, Delete, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'User favorites retrieved successfully' })
  async getUserFavorites(@Req() req: any) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Post(':pokemonId')
  @ApiOperation({ summary: 'Add Pokemon to favorites' })
  @ApiParam({ name: 'pokemonId', description: 'Pokemon ID' })
  @ApiResponse({ status: 201, description: 'Pokemon added to favorites' })
  @ApiResponse({ status: 409, description: 'Pokemon is already in favorites' })
  async addFavorite(@Req() req: any, @Param('pokemonId', ParseIntPipe) pokemonId: number) {
    return this.favoritesService.addFavorite(req.user.id, pokemonId);
  }

  @Delete(':pokemonId')
  @ApiOperation({ summary: 'Remove Pokemon from favorites' })
  @ApiParam({ name: 'pokemonId', description: 'Pokemon ID' })
  @ApiResponse({ status: 200, description: 'Pokemon removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(@Req() req: any, @Param('pokemonId', ParseIntPipe) pokemonId: number) {
    return this.favoritesService.removeFavorite(req.user.id, pokemonId);
  }

  @Get('check/:pokemonId')
  @ApiOperation({ summary: 'Check if Pokemon is favorited' })
  @ApiParam({ name: 'pokemonId', description: 'Pokemon ID' })
  @ApiResponse({ status: 200, description: 'Favorite status checked' })
  async checkIsFavorite(@Req() req: any, @Param('pokemonId', ParseIntPipe) pokemonId: number) {
    return this.favoritesService.checkIsFavorite(req.user.id, pokemonId);
  }
}