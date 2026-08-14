# Frontend Application - OTP Webportal

## Overview
The client-side user interface application built with React, Vite, and TypeScript. It provides a dashboard to manage users, stores, responsibilities, system settings, view paginated OTP history, and perform bulk database synchronizations via Excel matrix uploads.

## Project Structure
frontend/
├── public/                         # Static public assets
├── src/                            # Source code directory
│   ├── components/                 # Reusable UI components
│   ├── hooks/                      # Custom React hooks
│   ├── layouts/                    # Page layout structure components
│   ├── locales/                    # Internationalization and language files
│   ├── pages/                      # Application view pages
│   ├── services/                   # API service connectors and handlers 
│   ├── types/                      # TypeScript type definitions and interfaces
│   ├── App.tsx                     # Root React component
│   ├── index.css                   # Global stylesheet
│   └── main.tsx                    # Application entry point
├── .env                            # Frontend environment configuration
├── Dockerfile                      # Container instructions for frontend
├── docker-compose.yaml             # Standalone docker compose configuration
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML root template

## Environment Variables (.env)
Create a .env file inside the frontend/ directory by copying the provided example file:

```bash 
cp .env.example .env 
```

## Installation & Running Locally

### 1. Install Dependencies
```bash 
npm install 
```

### 2. Start Development Server
```bash 
npm run dev 
```