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
- **Authentication**: Firebase Authentication (user login/registration)
- **Primary Database**: Supabase PostgreSQL (user's permanent database)
- **Backup Database**: Replit PostgreSQL (fallback option)
- **Local Fallback**: LocalStorage for offline mode
- **Tables**: users, products, sales, expenses (via Drizzle ORM)
- **Real-time Updates**: Firebase real-time listeners for auth state
- **Image Storage**: Firebase Storage for product images

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

### Transaction Management System
- **Worker Tracking**: Comprehensive tracking of individual worker performance
- **Date Filtering**: Filter transactions by specific dates, weeks, months
- **Performance Analytics**: Total sales, expenses, net profit per worker
- **Transaction History**: Detailed view of all worker transactions
- **Visual Overview**: Card-based interface with color-coded metrics

### Advanced Data Analysis
- **Multiple Chart Types**: Bar, Line, Area, Pie, and Composed charts
- **Comparative Analysis**: Side-by-side worker performance comparison
- **Time-based Filtering**: Today, week, month, 3 months, 6 months, year, all time
- **Real-time Statistics**: Dynamic calculation of totals and averages
- **Interactive Visualizations**: Responsive charts with tooltip details

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
- July 03, 2025. Enhanced worker sales interface with product grid display and voice input
- July 03, 2025. Fixed Firebase composite index issues by simplifying queries
- July 03, 2025. Enhanced product management with image upload via Firebase Storage
- July 03, 2025. Improved UI visibility and contrast in login and dashboard screens
- July 03, 2025. Fixed modal scrolling issues in product management forms
- July 03, 2025. Enhanced error handling and offline fallback mechanisms
- July 04, 2025. Fixed Vercel deployment issues by removing serverless function conflicts and creating proper static site configuration
- July 04, 2025. Migrated from Replit Agent to Replit environment successfully
- July 04, 2025. Fixed product image upload functionality with Firebase Storage and local storage fallback
- July 04, 2025. Created comprehensive Transaction Management system with worker tracking and date filtering
- July 04, 2025. Built advanced Data Analysis system with multiple chart types and comparative analytics
- July 04, 2025. Integrated stunning cosmic starfield background with interactive black hole animation, relativistic jets, and mouse parallax effects
- July 04, 2025. Mobile layout optimization with compact cards, trading-style dashboard, and professional UI improvements
- July 04, 2025. UI reorganization: moved Firebase Test and Add Worker buttons to Settings page, removed unnecessary Quick button
- July 04, 2025. Enhanced bottom navigation with Transactions tab for owners and improved mobile responsiveness
- July 04, 2025. Temporarily tested PostgreSQL database migration, then restored Firebase as primary database per user preference for data permanence
- July 04, 2025. Implemented comprehensive Transaction Management system with 3-tier navigation: Workers → Worker Details → Date Transactions
- July 04, 2025. Built advanced Data Analysis Center with All Workers Data, Compare Workers, and Individual Worker analysis modes
- July 04, 2025. Created OptimizedLayout component with professional desktop sidebar and mobile-first responsive design
- July 04, 2025. Major UI overhaul: Replaced UniversalLayout with OptimizedLayout featuring emoji-enhanced navigation (🏠📊📦💸🧾📋⚙️)
- July 04, 2025. Mobile optimization: Shrunk UI elements for PWA display with smaller fonts, compact cards, and better mobile spacing
- July 04, 2025. Dashboard transformation: Replaced transaction lists with interactive charts (Bar, Area, Pie) for trading-style analytics
- July 04, 2025. Added Analysis navigation item after Home, moved Settings to right side as requested
- July 04, 2025. Fixed product upload functionality with proper Firebase Storage fallback to local storage for offline mode
- July 04, 2025. Successfully migrated from Replit Agent to Replit environment with hybrid Firebase/Supabase architecture
- July 04, 2025. Configured Firebase for authentication and Supabase for data storage using environment variables
- July 04, 2025. Complete UI redesign with ResponsiveLayout component for perfect mobile and desktop experience
- July 04, 2025. Fixed role-based navigation: Workers can only access Home, Sales, Expenses, and Settings (Analysis is now owner-only)
- July 04, 2025. Created comprehensive mobile-optimized CSS styles for all pages (Sales, Products, Analysis, Expenses, Transactions, Settings)
- July 04, 2025. Implemented touch-friendly mobile interface with properly sized elements and improved navigation

## Deployment Guide

### Vercel Deployment
The system is configured for Vercel deployment with the following setup:

1. **Framework Selection**: Choose "Other" or "Static Site" when deploying to Vercel
2. **Build Configuration**: 
   - Build Command: `npm run build:client`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

3. **Environment Variables Required**:
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `NODE_ENV`: Set to `production`

4. **Files Created for Deployment**:
   - `vercel.json`: Vercel configuration for routing and builds
   - `build-vercel.js`: Custom build script for preparation

5. **Deployment Steps**:
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy (automatic builds will run)

### Alternative: Next.js Deployment
If you prefer Next.js framework:
- Use the created `app/` directory structure
- Change framework to Next.js in Vercel
- Update scripts to use Next.js build system

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design: Modern restaurant theme with Charnoks branding, animations, and professional appearance.
Deployment: Vercel with current Express/React structure preferred.