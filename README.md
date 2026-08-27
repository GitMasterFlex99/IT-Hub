# IT-Hub

A portfolio-grade IT service desk and asset management application.

IT-Hub models a small internal support operation: technicians can manage incidents, track SLA health, search tickets, and keep an inventory of company devices.

## Project goals

- Demonstrate practical CRUD application design
- Model real IT support workflows
- Provide an operational dashboard rather than a static demo
- Keep the code understandable and easy to extend

## Planned stack

- Frontend: React + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: SQLite
- Validation: Zod
- Testing: Vitest
- API: REST

## Core features

- Ticket lifecycle: New → In Progress → Waiting → Resolved
- Priority and SLA monitoring
- Technician assignment
- Full-text ticket search and filters
- Asset inventory with device status
- Dashboard metrics
- REST API with validation and error handling
- Seed data for a realistic demo environment

## Architecture

`React UI → REST API → Service layer → SQLite`

The application intentionally separates presentation, business logic, and persistence so that the project demonstrates maintainable application structure rather than a single-page mockup.

## Development

The repository is being developed incrementally. Each major feature is kept small enough to review independently and documented as it is introduced.
