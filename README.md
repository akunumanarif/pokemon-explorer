# 🔥 Pokemon Explorer

A full-stack Pokemon Explorer application built with **NestJS**, **Next.js**, **Docker**, and **PostgreSQL**. This project allows users to browse Pokemon, create teams, manage favorites, and includes a complete authentication system.

## 🚀 Features

### Core Features
- **Pokemon Browsing**: List Pokemon with pagination from PokeAPI
- **Search & Filter**: Search Pokemon by name and filter by type
- **Pokemon Details**: View detailed stats, abilities, and types
- **User Authentication**: JWT-based auth with registration and login
- **Favorites System**: Mark and manage favorite Pokemon
- **Team Builder**: Create teams of up to 6 Pokemon with no duplicates
- **Responsive Design**: Mobile-first responsive UI

### Technical Features
- **Monorepo Architecture** with npm workspaces
- **Docker Containerization** for easy deployment
- **API Documentation** with Swagger/OpenAPI
- **Database Caching** of Pokemon data
- **Rate Limiting** for API protection
- **Type Safety** with TypeScript throughout
- **Modern UI** with Tailwind CSS and shadcn/ui

## 🏗️ Project Structure

```
pokemon-explorer/
├── apps/
│   ├── backend/           # NestJS API Server
│   │   ├── src/
│   │   │   ├── auth/      # Authentication module
│   │   │   ├── pokemon/   # Pokemon data management
│   │   │   ├── favorites/ # User favorites
│   │   │   ├── teams/     # Team management
│   │   │   └── users/     # User management
│   │   ├── prisma/        # Database schema & migrations
│   │   └── Dockerfile
│   └── frontend/          # Next.js React App
│       ├── src/
│       │   ├── app/       # App Router pages
│       │   ├── components/ # Reusable components
│       │   └── lib/       # Utilities & API clients
│       └── Dockerfile
├── packages/
│   └── shared/            # Shared types & utilities
├── docker-compose.yml     # Production config
├── docker-compose.dev.yml # Development config
└── README.md
```

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pokemon-explorer
```

### 2. Start the Application
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run prod

# Background mode
npm run dev:detached
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

### 4. Default User Accounts
The application includes seeded demo accounts:

**Demo Trainer**
- Email: `demo@pokemon.com`
- Username: `demo_trainer`
- Password: `password123`

**Ash Ketchum**
- Email: `ash@pokemon.com`
- Username: `ash_ketchum`
- Password: `password123`

## 🛠️ Development Commands

```bash
# Start development environment
npm run dev

# View logs
npm run logs                # All services
npm run logs:backend        # Backend only
npm run logs:frontend       # Frontend only
npm run logs:db            # Database only

# Database operations
npm run db:migrate         # Run migrations
npm run db:seed           # Seed database
npm run db:reset          # Reset database

# Container management
npm run stop              # Stop all services
npm run clean             # Clean restart (removes volumes)

# Access container shells
npm run shell:backend     # Backend container shell
npm run shell:frontend    # Frontend container shell
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM:

### Core Tables
- **Users**: User accounts with authentication
- **Pokemon**: Cached Pokemon data from PokeAPI
- **Favorites**: User-specific favorite Pokemon
- **Teams**: User-created Pokemon teams
- **TeamMembers**: Pokemon assigned to team positions
- **RefreshTokens**: JWT refresh token management

### Key Features
- **Referential Integrity**: Foreign key constraints
- **Unique Constraints**: No duplicate favorites, team positions
- **Cascading Deletes**: Cleanup on user/team deletion
- **Indexing**: Optimized queries for performance

## 🔐 Authentication System

### Features
- **JWT Access Tokens**: Short-lived (15 minutes)
- **Refresh Tokens**: Long-lived (7 days) 
- **Password Security**: bcrypt hashing with salt rounds 12
- **Rate Limiting**: Protection against brute force attacks
- **Session Management**: Secure token storage and validation

### API Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/refresh      # Token refresh
POST /api/auth/logout       # User logout
GET  /api/auth/profile      # Get user profile
```

## 🎮 API Documentation

### Pokemon Endpoints
```
GET  /api/pokemon           # List Pokemon (paginated)
GET  /api/pokemon/search    # Search Pokemon by name
GET  /api/pokemon/types     # Get all Pokemon types
GET  /api/pokemon/:id       # Get Pokemon by ID
GET  /api/pokemon/name/:name # Get Pokemon by name
```

### Favorites Endpoints (Protected)
```
GET    /api/favorites           # Get user favorites
POST   /api/favorites/:id       # Add to favorites
DELETE /api/favorites/:id       # Remove from favorites
GET    /api/favorites/check/:id # Check if favorited
```

### Teams Endpoints (Protected)
```
GET    /api/teams              # Get user teams
GET    /api/teams/public       # Get public teams
POST   /api/teams              # Create team
PUT    /api/teams/:id          # Update team
DELETE /api/teams/:id          # Delete team
POST   /api/teams/:id/members  # Add Pokemon to team
DELETE /api/teams/:id/members/:pokemonId # Remove from team
PUT    /api/teams/:id/members/:pokemonId # Update team member
```

## 🎨 Frontend Features

### Pages
- **Home**: Pokemon list with search and filters
- **Pokemon Detail**: Comprehensive Pokemon information
- **Login/Register**: Authentication pages
- **Dashboard**: User overview with stats
- **Favorites**: User's favorite Pokemon
- **Teams**: Team management interface
- **Team Builder**: Interactive team creation

### Components
- **PokemonCard**: Reusable Pokemon display component
- **StatsChart**: Visual representation of Pokemon stats
- **SearchBar**: Real-time search with debouncing
- **TypeFilter**: Filter Pokemon by type
- **TeamSlots**: Drag & drop team building interface

### State Management
- **React Query**: API calls, caching, and synchronization
- **NextAuth**: Authentication state management
- **Local State**: UI interactions and form management

## 🚀 Production Deployment

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# Frontend
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-frontend-domain.com
```

### Docker Production Build
```bash
# Build production images
docker-compose build

# Start production services
docker-compose up -d

# Check service health
docker-compose ps
docker-compose logs -f
```

## 🧪 Testing & Quality

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Error Boundaries**: Graceful error handling

### API Testing
- **Swagger UI**: Interactive API documentation
- **Health Checks**: Service monitoring endpoints
- **Validation**: Request/response validation with DTOs

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose logs db

# Reset database
npm run db:reset
```

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :5432

# Stop conflicting services
docker-compose down
```

#### Clear Docker Cache
```bash
# Remove all containers and volumes
docker-compose down -v --remove-orphans

# Clean Docker system
docker system prune -af
```

## 📚 Technology Stack

### Backend
- **NestJS**: Progressive Node.js framework
- **Prisma**: Next-generation ORM
- **PostgreSQL**: Robust relational database
- **JWT**: JSON Web Tokens for authentication
- **Swagger**: API documentation
- **bcryptjs**: Password hashing
- **Axios**: HTTP client for PokeAPI

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **React Query**: Data fetching and state management
- **NextAuth.js**: Authentication for Next.js
- **Recharts**: Charting library for statistics

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **PostgreSQL**: Production database
- **Nginx**: Production web server (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PokeAPI**: For providing comprehensive Pokemon data
- **NestJS Team**: For the excellent backend framework
- **Vercel Team**: For Next.js and the amazing developer experience
- **Prisma Team**: For the modern database toolkit
- **shadcn**: For the beautiful UI components

---

**Built with ❤️ for the Pokemon community and Modinity Engineering Test**