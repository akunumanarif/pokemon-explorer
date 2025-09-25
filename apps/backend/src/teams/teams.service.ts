import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto/team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async getUserTeams(userId: number) {
    const teams = await this.prisma.team.findMany({
      where: { userId },
      include: {
        members: {
          include: {
            pokemon: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: teams,
      count: teams.length,
    };
  }

  async getTeamById(teamId: number, userId?: number) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            pokemon: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user has permission to view team
    if (!team.isPublic && team.userId !== userId) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async createTeam(userId: number, createTeamDto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        ...createTeamDto,
        userId,
      },
      include: {
        members: {
          include: {
            pokemon: true,
          },
        },
      },
    });

    return {
      data: team,
      message: 'Team created successfully',
    };
  }

  async updateTeam(teamId: number, userId: number, updateTeamDto: UpdateTeamDto) {
    // Check if team exists and belongs to user
    const existingTeam = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam || existingTeam.userId !== userId) {
      throw new NotFoundException('Team not found');
    }

    const team = await this.prisma.team.update({
      where: { id: teamId },
      data: updateTeamDto,
      include: {
        members: {
          include: {
            pokemon: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return {
      data: team,
      message: 'Team updated successfully',
    };
  }

  async deleteTeam(teamId: number, userId: number) {
    // Check if team exists and belongs to user
    const existingTeam = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam || existingTeam.userId !== userId) {
      throw new NotFoundException('Team not found');
    }

    await this.prisma.team.delete({
      where: { id: teamId },
    });

    return {
      message: 'Team deleted successfully',
    };
  }

  async addTeamMember(teamId: number, userId: number, addMemberDto: AddTeamMemberDto) {
    // Check if team exists and belongs to user
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team || team.userId !== userId) {
      throw new NotFoundException('Team not found');
    }

    // Check if team already has 6 members
    if (team.members.length >= 6) {
      throw new BadRequestException('Team is already full (maximum 6 Pokemon)');
    }

    // Check if position is already taken
    const existingMemberAtPosition = team.members.find(m => m.position === addMemberDto.position);
    if (existingMemberAtPosition) {
      throw new ConflictException(`Position ${addMemberDto.position} is already taken`);
    }

    // Check if Pokemon is already in team
    const existingPokemon = team.members.find(m => m.pokemonId === addMemberDto.pokemonId);
    if (existingPokemon) {
      throw new ConflictException('Pokemon is already in this team');
    }

    const member = await this.prisma.teamMember.create({
      data: {
        teamId,
        pokemonId: addMemberDto.pokemonId,
        position: addMemberDto.position,
        nickname: addMemberDto.nickname,
      },
      include: {
        pokemon: true,
      },
    });

    return {
      data: member,
      message: 'Pokemon added to team',
    };
  }

  async removeTeamMember(teamId: number, userId: number, pokemonId: number) {
    // Check if team exists and belongs to user
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team || team.userId !== userId) {
      throw new NotFoundException('Team not found');
    }

    // Find team member
    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_pokemonId: {
          teamId,
          pokemonId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Pokemon not found in team');
    }

    await this.prisma.teamMember.delete({
      where: { id: member.id },
    });

    return {
      message: 'Pokemon removed from team',
    };
  }

  async updateTeamMember(teamId: number, userId: number, pokemonId: number, updates: { position?: number; nickname?: string }) {
    // Check if team exists and belongs to user
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });

    if (!team || team.userId !== userId) {
      throw new NotFoundException('Team not found');
    }

    // Find team member
    const member = await this.prisma.teamMember.findUnique({
      where: {
        teamId_pokemonId: {
          teamId,
          pokemonId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Pokemon not found in team');
    }

    // Check if new position is already taken (if position is being updated)
    if (updates.position && updates.position !== member.position) {
      const existingMemberAtPosition = team.members.find(m => m.position === updates.position && m.id !== member.id);
      if (existingMemberAtPosition) {
        throw new ConflictException(`Position ${updates.position} is already taken`);
      }
    }

    const updatedMember = await this.prisma.teamMember.update({
      where: { id: member.id },
      data: updates,
      include: {
        pokemon: true,
      },
    });

    return {
      data: updatedMember,
      message: 'Team member updated successfully',
    };
  }

  async getPublicTeams(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          members: {
            include: {
              pokemon: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      this.prisma.team.count({
        where: { isPublic: true },
      }),
    ]);

    return {
      data: teams,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}