import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { PokemonListDto } from './dto/pokemon.dto';

@ApiTags('Pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'Get Pokemon list with pagination' })
  @ApiResponse({ status: 200, description: 'Pokemon list retrieved successfully' })
  async getPokemonList(@Query() query: PokemonListDto) {
    return this.pokemonService.getPokemonList(query);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all Pokemon types' })
  @ApiResponse({ status: 200, description: 'Pokemon types retrieved successfully' })
  async getPokemonTypes() {
    return this.pokemonService.getPokemonTypes();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Pokemon by name' })
  @ApiResponse({ status: 200, description: 'Pokemon search results' })
  async searchPokemon(@Query('q') searchTerm: string) {
    return this.pokemonService.searchPokemon(searchTerm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Pokemon by ID' })
  @ApiParam({ name: 'id', description: 'Pokemon ID' })
  @ApiResponse({ status: 200, description: 'Pokemon details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  async getPokemonById(@Param('id', ParseIntPipe) id: number) {
    return this.pokemonService.getPokemonById(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get Pokemon by name' })
  @ApiParam({ name: 'name', description: 'Pokemon name' })
  @ApiResponse({ status: 200, description: 'Pokemon details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  async getPokemonByName(@Param('name') name: string) {
    return this.pokemonService.getPokemonByName(name);
  }
}