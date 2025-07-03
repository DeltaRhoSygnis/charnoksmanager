# Sari POS - Point of Sale System

## Overview

Sari POS is a complete Point of Sale solution designed for small businesses and sari-sari stores. It's a full-stack web application built with React, TypeScript, Express, and Firebase/PostgreSQL, featuring a modern UI with shadcn/ui components and responsive design for both desktop and mobile devices.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with Context API for authentication
- **Data Fetching**: TanStack Query for server state management
- **Routing**: React Router for navigation
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth integration
- **Session Management**: PostgreSQL session store
- **API Structure**: RESTful endpoints with `/api` prefix
- **Development**: Hot reloading with Vite middleware integration

### Database Design
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Schema Location**: `shared/schema.ts` for shared types
- **Migration Strategy**: Drizzle Kit for database migrations
- **Fallback Storage**: In-memory storage for development/testing

## Key Components

### Authentication System
- **Provider**: Firebase Authentication
- **User Roles**: Owner and Worker roles with different permissions
- **Protected Routes**: Role-based access control
- **Fallback Auth**: Local storage for demo mode

### Product Management
- **CRUD Operations**: Full product lifecycle management
- **Inventory Tracking**: Real-time stock level monitoring
- **Categories**: Product categorization system
- **Image Support**: Product image URLs

### Sales System
- **Point of Sale**: Interactive shopping cart interface
- **Voice Input**: Web Speech API integration for voice transactions
- **Quick Sale**: Simplified sale recording for workers
- **Transaction History**: Comprehensive sales tracking

### Multi-User Support
- **Owner Dashboard**: Full analytics and management capabilities
- **Worker Interface**: Simplified sales recording interface
- **Worker Account Creation**: Owner can create worker accounts
- **Role-Based UI**: Different interfaces based on user role

### Offline Capability
- **Demo Mode**: Local storage fallback when Firebase is unavailable
- **Offline Detection**: Automatic fallback to demo mode
- **Data Persistence**: Local storage for offline transactions
- **Connection Testing**: Firebase connectivity validation

## Data Flow

1. **Authentication Flow**:
   - User authenticates via Firebase Auth
   - User role is determined from Firestore
   - Protected routes enforce role-based access

2. **Product Management Flow**:
   - Products stored in PostgreSQL via Drizzle ORM
   - Real-time inventory updates on sales
   - Fallback to local storage in demo mode

3. **Sales Transaction Flow**:
   - Cart items selected via UI or voice input
   - Transaction validation and stock checking
   - Database persistence with audit trail
   - Inventory automatic updates

4. **Offline Flow**:
   - Connection test on app initialization
   - Automatic demo mode activation on failure
   - Local storage persistence for offline usage
   - Firebase sync when connection restored

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React Router, React Hook Form
- **UI Components**: Radix UI primitives, shadcn/ui components
- **Database**: Drizzle ORM, PostgreSQL client (@neondatabase/serverless)
- **Authentication**: Firebase SDK
- **Styling**: Tailwind CSS, class-variance-authority
- **Validation**: Zod schema validation
- **Development**: Vite, TypeScript, ESBuild

### Development Tools
- **Replit Integration**: Vite plugin for Replit-specific features
- **Error Handling**: Runtime error overlay for development
- **Code Quality**: TypeScript strict mode, ESLint configuration

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` with hot reloading
- **Database**: Drizzle push for schema updates
- **Environment**: NODE_ENV=development with Vite dev server

### Production Build
- **Client Build**: Vite production build to `dist/public`
- **Server Build**: ESBuild bundle to `dist/index.js`
- **Static Serving**: Express serves built client files
- **Database**: PostgreSQL with connection pooling

### Environment Configuration
- **Database URL**: Required DATABASE_URL environment variable
- **Firebase Config**: Hardcoded configuration for demo purposes
- **Session Storage**: PostgreSQL session store for production

## Recent UI Redesign

### Charnoks Branding Integration
- **Brand Identity**: Fully integrated Charnoks "Special Fried Chicken" logo and branding
- **Color Scheme**: Updated to use red, orange, and yellow gradient theme matching Charnoks brand
- **Logo Usage**: Widened and prominently displayed Charnoks logo across all interfaces
- **Typography**: Added custom "charnoks-text" gradient styling for brand consistency

### Modern Animations & Effects
- **Gradient Animation**: Animated background gradients with `animate-gradient-x` class
- **Bounce Effects**: `animate-bounce-in` for element entrance animations
- **Slide Animations**: `animate-slide-in-left` and `animate-slide-in-right` for dynamic content
- **Glow Effects**: `animate-pulse-glow` for interactive elements and logo highlighting
- **Hover Transitions**: Scale and opacity transforms for interactive cards

### Component Redesigns
- **Login Page**: Complete redesign with Charnoks branding, larger logo display, modern glass morphism
- **Register Page**: Matching design with enhanced user experience and brand consistency
- **Owner Dashboard**: Updated with Charnoks theme, improved quick actions, and animated elements
- **Worker Dashboard**: Redesigned with restaurant-focused interface and modern card layouts
- **Background**: Changed from blue theme to Charnoks red/orange/yellow gradient theme

### Technical Implementation
- **CSS Variables**: Added Charnoks brand colors to CSS custom properties
- **Animation Classes**: Custom keyframes and utility classes for smooth animations
- **Glass Morphism**: Enhanced backdrop blur effects with better transparency
- **Responsive Design**: Maintained mobile-first approach with brand consistency

## Changelog

Changelog:
- July 03, 2025. Initial setup and migration from Lovable to Replit
- July 03, 2025. Complete UI redesign with Charnoks branding and modern animations

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design: Modern restaurant theme with Charnoks branding, animations, and professional appearance.