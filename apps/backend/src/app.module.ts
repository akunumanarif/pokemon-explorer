import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { FavoritesModule } from './favorites/favorites.module';
import { TeamsModule } from './teams/teams.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    PokemonModule,
    FavoritesModule,
    TeamsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}