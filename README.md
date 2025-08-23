# Kwikr Directory

A comprehensive platform connecting Canadian service providers (contractors) with clients who need jobs completed, featuring an admin layer for platform management.

## Project Overview

- **Name**: Kwikr Directory
- **Goal**: Connect verified Canadian service providers with clients through a secure, escrow-protected marketplace
- **Features**: Role-based access (Client, Worker, Admin), job posting/bidding, compliance verification, secure payments

## Live URLs

- **Development**: https://3000-ic9dwx11plqgddgjpefrf-6532622b.e2b.dev
- **API Health**: https://3000-ic9dwx11plqgddgjpefrf-6532622b.e2b.dev/api/jobs/categories

## Data Architecture

### Core Data Models
- **Users**: Multi-role system (client, worker, admin) with profiles and authentication
- **Jobs**: Client job postings with categories, budgets, locations, and status tracking
- **Bids**: Worker bid submissions with amounts, timelines, and status management
- **Compliance**: Worker verification system for licenses, insurance, and WSIB
- **Reviews**: Bidirectional rating system for jobs and service providers
- **Transactions**: Payment tracking with escrow and platform fee management

### Storage Services
- **Cloudflare D1**: Primary SQLite database for all relational data
- **Local Development**: Automatic local SQLite with `--local` flag
- **Session Management**: Token-based authentication with expiration

### Data Flow
1. **Registration**: Users register with role selection → Profile creation → (Workers) Compliance verification
2. **Job Workflow**: Job posting → Bidding → Assignment → Completion → Payment → Review
3. **Payments**: Escrow hold → Work completion → Client approval → Worker payout + Platform fee
4. **Compliance**: Document upload → Admin review → Verification status → Job eligibility

## Current Features (Implemented)

### ✅ Core Platform
- [x] Landing page with Kwikr branding (#00C881 green)
- [x] User registration and authentication system
- [x] Role-based routing (client/worker/admin dashboards)
- [x] Responsive design with Tailwind CSS

### ✅ Database & Backend
- [x] Complete SQLite schema with 15+ tables
- [x] Authentication with session management
- [x] RESTful API endpoints for all core functions
- [x] Local D1 database with seed data
- [x] Hono framework with Cloudflare Pages architecture

### ✅ Client Features
- [x] Client dashboard with job management
- [x] Job posting form with categories and budgets
- [x] Job status tracking (posted → assigned → completed)
- [x] Statistics dashboard (total jobs, active, completed, bids)

### ✅ Data Models
- [x] 12 service categories (Construction, Plumbing, Electrical, etc.)
- [x] Canadian provinces and compliance requirements
- [x] Pricing tiers (Pay-as-you-go, Growth, Pro)
- [x] Notification system

### ✅ Admin System
- [x] Admin dashboard structure
- [x] Compliance review system
- [x] User management endpoints
- [x] Platform analytics framework

## Features In Development

### 🔄 Worker Features
- [ ] Worker onboarding flow with compliance verification
- [ ] Service management (categories, rates, availability)
- [ ] Job browsing with filtering (location, category, budget)
- [ ] Bidding system with cover messages and timelines
- [ ] Worker dashboard with earnings tracking

### 🔄 Bidding & Job Management  
- [ ] Client bid review and acceptance system
- [ ] Job-specific messaging between clients and workers
- [ ] File upload for job details and progress photos
- [ ] Job status updates and milestone tracking

### 🔄 Compliance & Verification
- [ ] Document upload system (licenses, insurance, WSIB)
- [ ] Province-specific compliance rules
- [ ] Admin verification workflow with CSV validation
- [ ] Automated compliance expiration alerts

## Recommended Next Steps

1. **Complete Worker Dashboard** - Implement job browsing, bidding, and service management
2. **Bidding System** - Enable worker bid submissions and client bid management
3. **Compliance Verification** - Build document upload and admin review system
4. **Messaging System** - Job-specific communication between clients and workers
5. **Stripe Integration** - Implement escrow payments and worker payouts
6. **Admin Tools** - Complete user management and platform analytics
7. **Mobile Optimization** - Enhance mobile experience and add PWA features

## Tech Stack

- **Backend**: Hono (TypeScript) on Cloudflare Workers
- **Frontend**: Vanilla JavaScript + Tailwind CSS
- **Database**: Cloudflare D1 (SQLite)
- **Development**: PM2 process management with Wrangler
- **Deployment**: Cloudflare Pages
- **Authentication**: Session-based with secure tokens

## Development Setup

```bash
# Install dependencies
npm install

# Apply database migrations
npm run db:migrate:local

# Seed test data
npm run db:seed

# Start development server
npm run clean-port && npm run build && pm2 start ecosystem.config.cjs

# View logs
pm2 logs kwikr-directory --nostream

# Test API
curl http://localhost:3000/api/jobs/categories
```

## Test Accounts (Available in Seed Data)

### Admin
- **Email**: admin@kwikr.ca
- **Password**: admin123

### Clients
- **Email**: sarah.johnson@example.com
- **Password**: client123
- **Location**: Toronto, ON

### Workers  
- **Email**: john.smith@example.com (Licensed Plumber)
- **Password**: worker123
- **Location**: Toronto, ON
- **Status**: Verified

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info

### Jobs
- `GET /api/jobs/categories` - Service categories
- `GET /api/jobs` - Browse jobs (with filters)
- `POST /api/jobs` - Create job (clients)
- `POST /api/jobs/:id/bids` - Submit bid (workers)

### Users
- `GET /api/users/profile` - User profile
- `POST /api/users/worker/compliance` - Submit compliance docs
- `GET /api/users/workers/search` - Search workers

### Admin
- `GET /api/admin/dashboard` - Platform metrics
- `GET /api/admin/compliance` - Compliance reviews
- `PUT /api/admin/compliance/:id` - Approve/reject compliance

## Compliance Requirements by Province

The platform enforces Canadian provincial compliance requirements:

- **WSIB**: Required for all workers
- **General Liability Insurance**: Required for all workers  
- **Professional Licenses**: Required for Construction, Plumbing, Electrical, HVAC, Roofing
- **Province-Specific**: Each province has specific licensing requirements

## Pricing Model

- **Pay-as-you-go**: 10% + $2 per job
- **Growth Plan**: $199/month (reduced fees)
- **Pro Plan**: $299/month (lowest fees)

## Last Updated

August 23, 2025 - Core platform implementation with authentication, job posting, and database schema complete.