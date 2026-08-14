# OTP Webportal & Ingest System

## Overview
A full-stack system designed to capture, process, and manage incoming OTP messages (SMS and WhatsApp) from mobile devices, forward them securely, store them in a centralized relational database, and notify designated users via email.

otp-webportal/
├── docker-compose.yaml             # Main configuration file to orchestrate backend & frontend
├── DB Design/                      # Database architecture schematics & ERD assets
│   ├── DB Design.txt               # Text outlines for database schema
│   ├── ERD OTP.png                 # Entity-Relationship Diagram image
│   └── ERD.vpp                     # Visual Paradigm project file
├── backend/                        
│   ├── .env                        # Backend environment configuration
│   ├── Dockerfile                  # Container instructions for backend
│   ├── docker-compose.yaml         # Standalone compose for backend
│   ├── package.json                # Backend dependencies and scripts
│   ├── prisma/                     # Database schema definitions and migrations
│   └── src/                        # Source code for controllers, routes, and jobs
└── frontend/                       
    ├── .env                        # Frontend environment configuration
    ├── Dockerfile                  # Container instructions for frontend
    ├── docker-compose.yaml         # Standalone compose for frontend
    ├── package.json                # Frontend dependencies and scripts
    ├── public/                     # Static assets
    └── src/                        # React components and service connectors

## Tech Stack

Backend: Node.js, Express, TypeScript, Prisma ORM, MySQL, Nodemailer

Frontend: React / Vite, TypeScript

## Getting Started (Local Development)

#### Prerequisites

Node.js (v18+)

Docker & Docker Desktop (optional, for containerization)

MySQL Database

#### Installation & Setup

Clone the repository and navigate to the project root.

Set up your environment variables for both backend and frontend in their respective .env files.

Install dependencies and run the services:

```bash
# Install backend dependencies
cd backend
npm install

# Run backend development server
npm run dev
```

## Docker Deployment (Optional)
If you are using Docker containers for deployment or local simulation:

```bash
docker-compose up --build
```