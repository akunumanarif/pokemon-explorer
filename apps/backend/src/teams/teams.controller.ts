import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Req, 
  Query, 
  UseGuards, 
  ParseIntPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto/team.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public teams' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Public teams retrieved successfully' })
  async getPublicTeams(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.teamsService.getPublicTeams(pageNum, limitNum);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user teams' })
  @ApiResponse({ status: 200, description: 'User teams retrieved successfully' })
  async getUserTeams(@Req() req: any) {
    return this.teamsService.getUserTeams(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async getTeamById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.teamsService.getTeamById(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  async createTeam(@Req() req: any, @Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.createTeam(req.user.id, createTeamDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team updated successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async updateTeam(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.updateTeam(id, req.user.id, updateTeamDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team deleted successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async deleteTeam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.teamsService.deleteTeam(id, req.user.id);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Add Pokemon to team',
    description: 'Add a Pokemon to the team. If position is not provided, it will be auto-assigned to the first available slot (1-6).'
  })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 201, description: 'Pokemon added to team successfully' })
  @ApiResponse({ status: 400, description: 'Team is full (6 Pokemon limit) or invalid data' })
  @ApiResponse({ status: 409, description: 'Pokemon already in team or specified position is already taken' })
  async addTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() addMemberDto: AddTeamMemberDto,
  ) {
    return this.teamsService.addTeamMember(id, req.user.id, addMemberDto);
  }

  @Delete(':id/members/:pokemonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove Pokemon from team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiParam({ name: 'pokemonId', description: 'Pokemon ID' })
  @ApiResponse({ status: 200, description: 'Pokemon removed from team' })
  @ApiResponse({ status: 404, description: 'Team or Pokemon not found' })
  async removeTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('pokemonId', ParseIntPipe) pokemonId: number,
    @Req() req: any,
  ) {
    return this.teamsService.removeTeamMember(id, req.user.id, pokemonId);
  }

  @Put(':id/members/:pokemonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update team member (position or nickname)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiParam({ name: 'pokemonId', description: 'Pokemon ID' })
  @ApiResponse({ status: 200, description: 'Team member updated successfully' })
  @ApiResponse({ status: 404, description: 'Team or Pokemon not found' })
  @ApiResponse({ status: 409, description: 'Position already taken' })
  async updateTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('pokemonId', ParseIntPipe) pokemonId: number,
    @Req() req: any,
    @Body() updates: { position?: number; nickname?: string },
  ) {
    return this.teamsService.updateTeamMember(id, req.user.id, pokemonId, updates);
  }
}