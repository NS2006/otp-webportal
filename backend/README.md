# Backend Service - OTP Webportal

## Overview
The backend API server and ingestion pipeline built with Node.js, Express, TypeScript, and Prisma ORM. It handles automated OTP extraction, database synchronization via Excel matrices, and automated email dispatching to active users.

## Project Structure
backend/
├── prisma/                         # Database schema definitions and migrations
├── src/                            
│   ├── config/                     # Database and environment configurations
│   ├── controllers/                # Request handlers 
│   ├── jobs/                       # Background jobs 
│   └── index.ts                    # Main entry point for the backend server
├── .env                            # Backend environment configuration
├── Dockerfile                      # Container instructions for backend
├── docker-compose.yaml             # Standalone docker compose configuration
├── package.json                    # Project dependencies and npm scripts
├── prisma.config.ts                # Prisma configuration file
├── tsconfig.json                   # TypeScript compiler configuration

## Environment Variables (.env)
Create a .env file inside the backend:
```bash 
cp .env.example .env 
```

## Installation & Running Locally

### 1. Install Dependencies
```bash 
npm install 
```

### 2. Database Commands & Prisma Setup

Inisialisasi / Reset Database
```bash 
npx prisma db push --force-reset
```

Kalau ada perubahan schema di ./prisma/schema.prisma, jalankan:
```bash 
npx prisma generate
```

### 3. Start Development Server
```bash 
npm run dev
```