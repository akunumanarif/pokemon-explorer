import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getUserFavorites(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        pokemon: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: favorites,
      count: favorites.length,
    };
  }

  async addFavorite(userId: number, pokemonId: number) {
    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_pokemonId: {
          userId,
          pokemonId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Pokemon is already in favorites');
    }

    // Ensure pokemon exists in database, if not fetch from PokeAPI and create
    let pokemon = await this.prisma.pokemon.findUnique({
      where: { id: pokemonId },
    });

    if (!pokemon) {
      // Fetch pokemon data from PokeAPI
      try {
        const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!pokeResponse.ok) {
          throw new Error('Pokemon not found in PokeAPI');
        }
        
        const pokeData = await pokeResponse.json();
        
        // Create pokemon record
        pokemon = await this.prisma.pokemon.create({
          data: {
            id: pokemonId,
            name: pokeData.name,
            imageUrl: pokeData.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
            types: JSON.stringify(pokeData.types.map((t: any) => t.type.name)),
            abilities: JSON.stringify(pokeData.abilities),
            stats: JSON.stringify({
              hp: pokeData.stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 0,
              attack: pokeData.stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 0,
              defense: pokeData.stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 0,
              'special-attack': pokeData.stats.find((s: any) => s.stat.name === 'special-attack')?.base_stat || 0,
              'special-defense': pokeData.stats.find((s: any) => s.stat.name === 'special-defense')?.base_stat || 0,
              speed: pokeData.stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 0,
            }),
            height: pokeData.height,
            weight: pokeData.weight,
            species: pokeData.species.name,
          },
        });
      } catch (error) {
        throw new Error(`Failed to fetch pokemon data: ${error.message}`);
      }
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        pokemonId,
      },
      include: {
        pokemon: true,
      },
    });

    return {
      data: favorite,
      message: 'Pokemon added to favorites',
    };
  }

  async removeFavorite(userId: number, pokemonId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_pokemonId: {
          userId,
          pokemonId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return {
      message: 'Pokemon removed from favorites',
    };
  }

  async checkIsFavorite(userId: number, pokemonId: number) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_pokemonId: {
          userId,
          pokemonId,
        },
      },
    });

    return {
      isFavorited: !!favorite,
    };
  }
}