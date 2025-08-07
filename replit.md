# Overview

DataNestX is a premium dataset marketplace application that connects data creators with data seekers. The platform enables users to buy, sell, and request high-quality datasets for AI and machine learning projects. It features a dual-role system where users can act as buyers (purchasing datasets or posting requests) or sellers (uploading datasets or submitting proposals). The application includes secure payment processing via Stripe, real-time messaging, file upload/download capabilities, and comprehensive user dashboards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Animations**: Framer Motion for smooth page transitions and micro-interactions
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript for full-stack type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Upload**: Multer middleware for handling dataset file uploads (500MB limit)
- **Email Service**: Nodemailer for OTP verification and notifications
- **Development**: Hot module replacement and middleware mode integration with Vite

## Data Storage Solutions
- **Primary Database**: PostgreSQL for relational data (users, datasets, requests, proposals, purchases, messages)
- **Database ORM**: Drizzle with schema-first approach and automatic migrations
- **File Storage**: Local filesystem storage for uploaded dataset files
- **Session Storage**: PostgreSQL with connect-pg-simple for session management
- **Schema Validation**: Zod schemas for runtime type validation across client and server

## Authentication and Authorization
- **Authentication Strategy**: JWT tokens with 7-day expiration
- **Password Security**: bcrypt with salt rounds for secure password hashing
- **Two-Factor Authentication**: Email-based OTP verification for account security
- **Role-Based Access**: Buyer and seller roles with different dashboard and feature access
- **Token Storage**: localStorage for client-side token persistence
- **Protected Routes**: Middleware-based route protection with user context

## External Dependencies

### Payment Processing
- **Stripe Integration**: Full payment processing with payment intents and customer management
- **Stripe Elements**: Secure payment forms with PCI compliance
- **Payment Flow**: Checkout creation, payment confirmation, and purchase tracking

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database URL**: Environment-based configuration for different deployment environments

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Modern icon library with consistent styling
- **Class Variance Authority**: Type-safe component variant management

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **TSX**: TypeScript execution engine for development server
- **Replit Integration**: Development banner and cartographer for Replit environment