# RELIVO

Relivo is a full-stack circular resource exchange platform designed to help organizations, donors, and communities redistribute useful items and resources more efficiently. The project combines a modern React + Vite frontend with a FastAPI backend and persistent SQLite storage to support a clean, mission-driven resource-sharing experience.

> Current status: Active development / MVP in progress. The core app flow and dashboard structure are in place, and the project is currently being finalized around UI polish, design restoration, and validation of the frontend/backend integration.

## Overview

RELIVO connects:
- Donors who want to contribute unused resources
- Recipients who need resources for community or operational use
- Admins who monitor allocation, requests, and platform activity

The platform includes:
- Landing page and marketing sections
- Login and registration flows
- Donor, recipient, and admin dashboards
- Resource upload and browse experience
- Request management and allocation logic
- AI-based recommendation support
- Notifications and analytics views

## Key Features

- Resource listing and discovery
- User roles and gated access
- Upload flow with validation and secure storage
- Request lifecycle management
- Circular economy / sustainability-focused UX
- AI-style recommendations and resource insights
- Responsive dashboard views for all user types
- Modern eco-tech design system with emerald/sage/amber branding

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Wouter (routing)
- Recharts
- Framer Motion / React Bits-inspired UI effects

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

## Project Structure

```text
RELIVO/
├── backend/
│   ├── algorithms/
│   ├── config.py
│   ├── database/
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── resources.db
├── client/
│   ├── public/
│   └── src/
├── server/
├── shared/
├── scripts/
├── package.json
├── vite.config.ts
├── README.md
├── .env.example
├── todo.md
├── ideas.md
└── ...
Current Progress
This project is currently in the refinement/finalization stage, with emphasis on:

- restoring the original emerald eco-tech visual identity
- fixing React Bits component import issues
-validating frontend build health
-maintaining the project’s feature-complete MVP behavior
-polishing stakeholder-facing design and user experience
The project is not yet a production deployment, but the core app architecture and workflows are in place for local development and demo use.
Design Direction
The interface follows a premium sustainability-tech aesthetic:

emerald green primary palette
cream/light surfaces
warm amber accents
modern glassmorphism-inspired cards
clean dashboard-first usability
restrained motion and polished premium UI
This gives the app a strong circular-economy identity without feeling overly flashy or generic.

Roadmap
Planned improvements include:

final UI polish and visual consistency
bug fixes and build cleanup
stronger backend validation and edge-case handling
more realistic resource lifecycle flows
expanded analytics and AI recommendation accuracy
deployment-ready configuration and production hardening
Notes
The app is intended as a demo / MVP-style project for academic or portfolio use.
It is currently under active refinement rather than final production release.
Database and upload storage should remain persistent in deployment environments.
