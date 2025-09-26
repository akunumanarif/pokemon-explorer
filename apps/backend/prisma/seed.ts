import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'demo@pokemon.com' },
    update: {},
    create: {
      email: 'demo@pokemon.com',
      username: 'demo_trainer',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Trainer',
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', // Pikachu
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'ash@pokemon.com' },
    update: {},
    create: {
      email: 'ash@pokemon.com',
      username: 'ash_ketchum',
      password: hashedPassword,
      firstName: 'Ash',
      lastName: 'Ketchum',
      avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', // Charizard
    },
  });

  // Create some sample Pokemon data (cache from PokeAPI)
  const samplePokemon = [
    {
      id: 1,
      name: 'bulbasaur',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      types: JSON.stringify(['grass', 'poison']),
      abilities: JSON.stringify({
        abilities: [
          { ability: { name: 'overgrow' }, is_hidden: false },
          { ability: { name: 'chlorophyll' }, is_hidden: true }
        ]
      }),
      stats: JSON.stringify({
        hp: 45,
        attack: 49,
        defense: 49,
        'special-attack': 65,
        'special-defense': 65,
        speed: 45
      }),
      height: 7,
      weight: 69,
      species: 'seed'
    },
    {
      id: 4,
      name: 'charmander',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      types: JSON.stringify(['fire']),
      abilities: JSON.stringify({
        abilities: [
          { ability: { name: 'blaze' }, is_hidden: false },
          { ability: { name: 'solar-power' }, is_hidden: true }
        ]
      }),
      stats: JSON.stringify({
        hp: 39,
        attack: 52,
        defense: 43,
        'special-attack': 60,
        'special-defense': 50,
        speed: 65
      }),
      height: 6,
      weight: 85,
      species: 'lizard'
    },
    {
      id: 7,
      name: 'squirtle',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
      types: JSON.stringify(['water']),
      abilities: JSON.stringify({
        abilities: [
          { ability: { name: 'torrent' }, is_hidden: false },
          { ability: { name: 'rain-dish' }, is_hidden: true }
        ]
      }),
      stats: JSON.stringify({
        hp: 44,
        attack: 48,
        defense: 65,
        'special-attack': 50,
        'special-defense': 64,
        speed: 43
      }),
      height: 5,
      weight: 90,
      species: 'tiny turtle'
    },
    {
      id: 25,
      name: 'pikachu',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      types: JSON.stringify(['electric']),
      abilities: JSON.stringify({
        abilities: [
          { ability: { name: 'static' }, is_hidden: false },
          { ability: { name: 'lightning-rod' }, is_hidden: true }
        ]
      }),
      stats: JSON.stringify({
        hp: 35,
        attack: 55,
        defense: 40,
        'special-attack': 50,
        'special-defense': 50,
        speed: 90
      }),
      height: 4,
      weight: 60,
      species: 'mouse'
    }
  ];

  for (const pokemon of samplePokemon) {
    await prisma.pokemon.upsert({
      where: { id: pokemon.id },
      update: {},
      create: pokemon,
    });
  }

  // Create sample favorites
  await prisma.favorite.createMany({
    data: [
      { userId: user1.id, pokemonId: 25 }, // Demo trainer likes Pikachu
      { userId: user1.id, pokemonId: 1 },  // Demo trainer likes Bulbasaur
      { userId: user2.id, pokemonId: 4 },  // Ash likes Charmander
      { userId: user2.id, pokemonId: 25 }, // Ash likes Pikachu
    ],
  });

  // Create sample teams
  const team1 = await prisma.team.create({
    data: {
      name: "Starter Squad",
      description: "My favorite starter Pokemon team",
      userId: user1.id,
      isPublic: true,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: "Ash's Team",
      description: "Gotta catch 'em all!",
      userId: user2.id,
      isPublic: true,
    },
  });

  // Add Pokemon to teams
  await prisma.teamMember.createMany({
    data: [
      { teamId: team1.id, pokemonId: 1, position: 1, nickname: "Bulby" },
      { teamId: team1.id, pokemonId: 4, position: 2, nickname: "Char" },
      { teamId: team1.id, pokemonId: 7, position: 3, nickname: "Squirt" },
      
      { teamId: team2.id, pokemonId: 25, position: 1, nickname: "Pikachu" },
      { teamId: team2.id, pokemonId: 4, position: 2, nickname: "Charmander" },
    ],
  });

  console.log('✅ Seeding finished.');
  console.log(`Created users: ${user1.email}, ${user2.email}`);
  console.log(`Created ${samplePokemon.length} sample Pokemon`);
  console.log(`Created 2 teams with members`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });