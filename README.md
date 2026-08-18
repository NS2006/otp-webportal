# OTP Webportal & Ingest System

## Overview
A full-stack system designed to capture, process, and manage incoming OTP messages (SMS and WhatsApp) from mobile devices, forward them securely, store them in a centralized relational database, and notify designated users via email.

## How It Works (System Flow)
The system bridges the gap between physical mobile devices receiving OTPs and the end-users who need them, operating in a seamless pipeline:
```
┌────────────────┐      POST /ingest      ┌──────────────────┐      Saves Data      ┌───────────────┐
│ Android Device │ ─────────────────────▶ │  Backend Server  │ ───────────────────▶│ MySQL Database│
| [Repo WA OTP]  |                        │ (Extract & Route)│                      │ (Stores & OTP)│
│ (WA/SMS Notif) │                        └──────────────────┘                      └───────────────┘
└────────────────┘                                 │                                        ▲
                                                   │ Sends Email                            │
                                                   ▼                                        │
                                          ┌──────────────────┐                      ┌───────────────┐
                                          │  Assigned Users  │                      │ Frontend App  │
                                          │  (Inbox/Email)   │                      │ (Web Portal)  │
                                          └──────────────────┘                      └───────────────┘
```

1. **Capture**: An Android device acting as the "primary device" receives an SMS or WhatsApp OTP. A separate companion app (WA OTP Forwarder) intercepts this notification.
2. **Ingest**: The forwarder app instantly sends the notification payload via a secure POST request to the Backend's /ingest endpoint.
3. **Process & Store**: The Backend API uses regex to extract the OTP code or link from the raw text, identifies the target store based on the receiving phone number, and securely logs the record into the MySQL database.
4. **Notify**: The system queries the database to find all active users assigned to that specific store, and automatically dispatches a mass email containing the OTP via Nodemailer.
5. **Manage**: Administrators and users can log into the Frontend web portal to view real-time OTP histories, manage user-store responsibilities (including bulk sync via Excel), and adjust system settings.


## Project Structure
```
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
```

## Tech Stack
- Backend: Node.js, Express, TypeScript, Prisma ORM, MySQL, Nodemailer
- Frontend: React / Vite, TypeScript

## Getting Started (Local Development)
#### Prerequisites
- Node.js (v18+)
- Docker & Docker Desktop (optional, for containerization)
- MySQL Database

#### Installation & Setup
- Clone the repository and navigate to the project root.
- Set up your environment variables for both backend and frontend in their respective .env files.
- Install dependencies and run the services:

- For Backend:
```bash
# Install backend dependencies
cd backend
npm install

# Run backend development server
npm run dev
```

- For Frontend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Run frontend development server
npm run dev
```

## Docker Deployment (Optional)
If you are using Docker containers for deployment or local simulation:

```bash
docker-compose up --build
```