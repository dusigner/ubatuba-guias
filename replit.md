# UbatubaIA - Ubatuba Tourism Web Application

## Overview

UbatubaIA is a comprehensive tourism web application focused on Ubatuba, São Paulo, Brazil. The application helps tourists plan personalized trips using AI-powered itinerary generation, while also serving as a platform for local guides and event producers to connect with visitors.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 2025 - Project Cleanup and Windows Setup
- Cleaned all temporary and unnecessary files for local deployment
- Created comprehensive Windows setup guide (SETUP_WINDOWS.md)
- Implemented enterprise-level security measures (rate limiting, XSS protection, SQL injection prevention)
- Created security documentation (SECURITY.md)
- Prepared project for download and local execution
- Updated documentation for Windows development environment

### January 2025 - Security Implementation
- Added comprehensive security measures against cyber attacks
- Implemented rate limiting (anti-DDoS and brute force protection)
- Added XSS and SQL injection protection
- Configured security headers (Helmet)
- Added input validation and sanitization
- Implemented malicious activity monitoring
- Created detailed security documentation

### January 2025 - Firebase Authentication Implementation
- Migrated from Replit Auth to Firebase Authentication with Google Sign-In
- Implemented Firebase SDK integration with React frontend
- Created Firebase hosting configuration for deployment
- Added local development setup with PostgreSQL support
- Updated authentication flow to use Firebase tokens
- Created deployment documentation for Firebase hosting
- Maintained backward compatibility during transition

### January 2025 - Footer Pages Implementation
- Created 8 comprehensive footer pages with detailed content and consistent UI
- Updated copyright from 2024 to 2025
- Implemented proper routing for all footer pages
- Pages include: Como Funciona, Nossa História, Parcerias, Contato, Central de Ajuda, Termos de Uso, Privacidade, Para Empresas
- All pages feature responsive design with back navigation and appropriate icons

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Router**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with structured route handlers
- **Authentication**: Replit Auth (OIDC) with session management
- **Session Storage**: PostgreSQL-based session store
- **AI Integration**: Google Gemini API for itinerary generation (free alternative)

### Database Architecture
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless driver with connection pooling

## Key Components

### Authentication System
- **Provider**: Firebase Authentication with Google Sign-In (replacing Replit Auth)
- **Session Management**: Firebase Authentication with backend session synchronization
- **User Types**: Four distinct user roles (tourists, guides, event producers, boat tour operators)
- **Profile Flow**: Post-login profile selection and creation system
- **Authorization**: Route-level protection with Firebase middleware

### AI-Powered Itinerary Generation
- **Service**: Google Gemini AI integration (free alternative to OpenAI)
- **Models**: gemini-2.5-flash for generation, gemini-2.5-pro for analysis
- **Input**: Natural language descriptions of travel preferences
- **Processing**: Two-step process (analyze preferences → generate itinerary)
- **Output**: Detailed multi-day itineraries with activities, times, and tips
- **Language**: Portuguese (pt-BR) responses
- **Benefits**: Free API with generous limits (15 req/min, 1M tokens/min, 1500 req/day)

### Core Modules
1. **Trails Module**: Hiking trails with difficulty ratings, distances, and reviews
2. **Beaches Module**: Beach information with amenities and attractions
3. **Boat Tours Module**: Marine excursions with pricing and schedules
4. **Events Module**: Local events with CRUD operations for producers
5. **Guides Module**: Local guide profiles created from user profiles with guide type
6. **Profile Management**: Post-login profile selection and creation system
7. **Footer Pages**: Complete set of institutional pages (Como Funciona, Nossa História, Parcerias, Contato, Central de Ajuda, Termos de Uso, Privacidade, Para Empresas)

### UI/UX Design
- **Theme**: Tropical/coastal design with custom color palette
- **Responsiveness**: Mobile-first approach with responsive components
- **Accessibility**: Radix UI ensures ARIA compliance
- **Loading States**: Skeleton components and loading indicators

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OIDC flow redirects to Replit authorization
3. Successful auth creates/updates user record
4. Session stored in PostgreSQL with TTL
5. Protected routes check session validity

### Itinerary Generation Flow
1. User submits preferences via form
2. Frontend validates data with Zod schema
3. Backend calls OpenAI API with structured prompt
4. AI generates Portuguese itinerary
5. Response saved to database and returned to client
6. Frontend displays formatted itinerary

### Content Management Flow
1. Authenticated users access role-specific forms
2. Form data validated on client and server
3. Database operations via Drizzle ORM
4. Real-time updates through TanStack Query
5. Optimistic updates for better UX

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **OpenAI API**: GPT-4o for itinerary generation
- **Replit Auth**: Authentication and user management
- **Unsplash**: Stock photography for UI elements

### Key Libraries
- **@neondatabase/serverless**: Database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **wouter**: Lightweight routing

### Development Tools
- **Vite**: Fast development server and bundler
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: ESBuild bundles Node.js server
- **Output**: Static assets served from `dist/public`
- **Entry Point**: `dist/index.js` for server

### Environment Configuration
- **Database**: `DATABASE_URL` for Neon connection
- **AI Service**: `OPENAI_API_KEY` for GPT integration
- **Auth**: Replit-managed environment variables
- **Sessions**: `SESSION_SECRET` for session encryption

### Hosting Strategy
- **Platform**: Designed for Replit deployment
- **Database**: Neon serverless PostgreSQL
- **Static Assets**: Served via Express in production
- **Development**: Vite dev server with HMR

### Performance Considerations
- **Database**: Connection pooling with Neon
- **Frontend**: Code splitting and lazy loading
- **Caching**: TanStack Query for client-side caching
- **Images**: Optimized external image sources
- **Bundle Size**: Tree-shaking and dead code elimination