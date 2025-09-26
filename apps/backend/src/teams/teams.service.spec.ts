import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamsService - addTeamMember', () => {
  let service: TeamsService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      team: {
        findUnique: jest.fn(),
      },
      teamMember: {
        create: jest.fn(),
      },
      pokemon: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prismaService = module.get(PrismaService);
  });

  describe('position assignment', () => {
    const mockTeam = {
      id: 1,
      userId: 1,
      name: 'Test Team',
      members: [
        { id: 1, pokemonId: 1, position: 1, nickname: 'Pika' },
        { id: 2, pokemonId: 2, position: 3, nickname: 'Char' },
      ],
    };

    const mockPokemon = {
      id: 25,
      name: 'pikachu',
      imageUrl: 'test.png',
      types: '["electric"]',
    };

    beforeEach(() => {
      prismaService.team.findUnique.mockResolvedValue(mockTeam as any);
      prismaService.pokemon.findUnique.mockResolvedValue(mockPokemon as any);
      prismaService.teamMember.create.mockResolvedValue({
        id: 3,
        teamId: 1,
        pokemonId: 25,
        position: 2,
        nickname: 'Pikachu',
      } as any);
    });

    it('should auto-assign position when not provided', async () => {
      const addMemberDto = {
        pokemonId: 25,
        nickname: 'Pikachu',
        // position not provided
      };

      await service.addTeamMember(1, 1, addMemberDto);

      expect(prismaService.teamMember.create).toHaveBeenCalledWith({
        data: {
          teamId: 1,
          pokemonId: 25,
          position: 2, // Should auto-assign to first available (position 2)
          nickname: 'Pikachu',
        },
        include: {
          pokemon: true,
        },
      });
    });

    it('should use provided position when valid', async () => {
      const addMemberDto = {
        pokemonId: 25,
        position: 4,
        nickname: 'Pikachu',
      };

      await service.addTeamMember(1, 1, addMemberDto);

      expect(prismaService.teamMember.create).toHaveBeenCalledWith({
        data: {
          teamId: 1,
          pokemonId: 25,
          position: 4, // Should use provided position
          nickname: 'Pikachu',
        },
        include: {
          pokemon: true,
        },
      });
    });

    it('should throw conflict when provided position is taken', async () => {
      const addMemberDto = {
        pokemonId: 25,
        position: 1, // Position already taken
        nickname: 'Pikachu',
      };

      await expect(service.addTeamMember(1, 1, addMemberDto))
        .rejects.toThrow(ConflictException);
      
      expect(prismaService.teamMember.create).not.toHaveBeenCalled();
    });

    it('should auto-assign to position 6 when positions 1-5 are taken', async () => {
      const fullTeam = {
        ...mockTeam,
        members: [
          { id: 1, pokemonId: 1, position: 1, nickname: 'P1' },
          { id: 2, pokemonId: 2, position: 2, nickname: 'P2' },
          { id: 3, pokemonId: 3, position: 3, nickname: 'P3' },
          { id: 4, pokemonId: 4, position: 4, nickname: 'P4' },
          { id: 5, pokemonId: 5, position: 5, nickname: 'P5' },
        ],
      };

      prismaService.team.findUnique.mockResolvedValue(fullTeam as any);

      const addMemberDto = {
        pokemonId: 25,
        nickname: 'Pikachu',
      };

      await service.addTeamMember(1, 1, addMemberDto);

      expect(prismaService.teamMember.create).toHaveBeenCalledWith({
        data: {
          teamId: 1,
          pokemonId: 25,
          position: 6, // Should auto-assign to last available
          nickname: 'Pikachu',
        },
        include: {
          pokemon: true,
        },
      });
    });

    it('should throw bad request when team is full', async () => {
      const fullTeam = {
        ...mockTeam,
        members: new Array(6).fill(null).map((_, i) => ({
          id: i + 1,
          pokemonId: i + 1,
          position: i + 1,
          nickname: `P${i + 1}`,
        })),
      };

      prismaService.team.findUnique.mockResolvedValue(fullTeam as any);

      const addMemberDto = {
        pokemonId: 25,
        nickname: 'Pikachu',
      };

      await expect(service.addTeamMember(1, 1, addMemberDto))
        .rejects.toThrow(BadRequestException);
      
      expect(prismaService.teamMember.create).not.toHaveBeenCalled();
    });
  });
});