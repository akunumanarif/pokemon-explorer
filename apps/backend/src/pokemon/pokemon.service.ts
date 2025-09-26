import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { PokemonListDto } from './dto/pokemon.dto';

interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  species: {
    name: string;
  };
}

@Injectable()
export class PokemonService {
  private readonly pokeApiUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.pokeApiUrl = this.configService.get('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2');
  }

  async getPokemonList(query: PokemonListDto) {
    const { page = 1, limit = 20, search, type } = query;
    const offset = (page - 1) * limit;

    try {
      let pokemonList: any[] = [];
      let total = 0;

      if (search) {
        // Search by name
        try {
          const pokemon = await this.getPokemonByName(search.toLowerCase());
          pokemonList = [pokemon];
          total = 1;
        } catch (error) {
          pokemonList = [];
          total = 0;
        }
      } else if (type) {
        // Filter by type
        const typeResponse = await axios.get(`${this.pokeApiUrl}/type/${type.toLowerCase()}`);
        const typePokemon = typeResponse.data.pokemon.map((p: any) => ({
          name: p.pokemon.name,
          url: p.pokemon.url,
        }));
        
        total = typePokemon.length;
        const paginatedPokemon = typePokemon.slice(offset, offset + limit);
        
        // Fetch detailed data for paginated results
        pokemonList = await Promise.all(
          paginatedPokemon.map(async (p: any) => {
            const id = this.extractIdFromUrl(p.url);
            return await this.getPokemonById(id);
          })
        );
      } else {
        // Get all pokemon with pagination
        const response = await axios.get(`${this.pokeApiUrl}/pokemon?offset=${offset}&limit=${limit}`);
        total = response.data.count;
        
        // Fetch detailed data for each pokemon
        pokemonList = await Promise.all(
          response.data.results.map(async (pokemon: any) => {
            const id = this.extractIdFromUrl(pokemon.url);
            return await this.getPokemonById(id);
          })
        );
      }

      return {
        data: pokemonList,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      throw new InternalServerErrorException('Failed to fetch Pokemon list');
    }
  }

  async getPokemonById(id: number) {
    try {
      // First, try to get from cache (database)
      let pokemon = await this.prisma.pokemon.findUnique({
        where: { id },
      });

      if (!pokemon) {
        // Fetch from PokeAPI and cache
        pokemon = await this.fetchAndCachePokemon(id);
      }

      return pokemon;
    } catch (error) {
      console.error(`Error fetching Pokemon with ID ${id}:`, error);
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }
  }

  async getPokemonByName(name: string) {
    try {
      // First, try to get from cache (database)
      let pokemon = await this.prisma.pokemon.findUnique({
        where: { name: name.toLowerCase() },
      });

      if (!pokemon) {
        // Fetch from PokeAPI
        const response = await axios.get(`${this.pokeApiUrl}/pokemon/${name.toLowerCase()}`);
        const pokeData: PokeApiPokemon = response.data;
        
        // Cache the pokemon
        pokemon = await this.cachePokemon(pokeData);
      }

      return pokemon;
    } catch (error) {
      console.error(`Error fetching Pokemon ${name}:`, error);
      throw new NotFoundException(`Pokemon ${name} not found`);
    }
  }

  async searchPokemon(searchTerm: string) {
    const term = searchTerm.toLowerCase();
    
    try {
      // Search in cached pokemon first
      const cachedResults = await this.prisma.pokemon.findMany({
        where: {
          name: {
            contains: term,
          },
        },
        take: 20,
      });

      if (cachedResults.length > 0) {
        return cachedResults;
      }

      // If no cached results, try exact match from PokeAPI
      try {
        const pokemon = await this.getPokemonByName(term);
        return [pokemon];
      } catch {
        return [];
      }
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      return [];
    }
  }

  async getPokemonTypes() {
    try {
      const response = await axios.get(`${this.pokeApiUrl}/type`);
      return response.data.results.map((type: any) => ({
        name: type.name,
        url: type.url,
      }));
    } catch (error) {
      console.error('Error fetching Pokemon types:', error);
      throw new InternalServerErrorException('Failed to fetch Pokemon types');
    }
  }

  private async fetchAndCachePokemon(id: number) {
    const response = await axios.get(`${this.pokeApiUrl}/pokemon/${id}`);
    const pokeData: PokeApiPokemon = response.data;
    
    return await this.cachePokemon(pokeData);
  }

  private async cachePokemon(pokeData: PokeApiPokemon) {
    const pokemonData = {
      id: pokeData.id,
      name: pokeData.name,
      imageUrl: pokeData.sprites.front_default || '',
      types: JSON.stringify(pokeData.types.map(t => t.type.name)),
      abilities: JSON.stringify({
        abilities: pokeData.abilities.map(a => ({
          ability: { name: a.ability.name },
          is_hidden: a.is_hidden,
        })),
      }),
      stats: JSON.stringify(pokeData.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {} as Record<string, number>)),
      height: pokeData.height,
      weight: pokeData.weight,
      species: pokeData.species.name,
    };

    return await this.prisma.pokemon.upsert({
      where: { id: pokeData.id },
      update: pokemonData,
      create: pokemonData,
    });
  }

  private extractIdFromUrl(url: string): number {
    const parts = url.split('/');
    return parseInt(parts[parts.length - 2], 10);
  }
}