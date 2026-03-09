# Bookstore SPA — Documentation

This directory contains all project documentation for the Bookstore User SPA.

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture, module design, state management patterns |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Local setup, environment configuration, coding standards |
| [API.md](API.md) | API endpoints, authentication flow, error handling |
| [TESTING.md](TESTING.md) | Testing strategy, unit/E2E patterns, coverage requirements |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Docker, Nginx, production deployment |

## API Contracts

The `contracts/` subdirectory contains the backend API contract documentation:

| File | Description |
|------|-------------|
| [contracts/openapi.json](contracts/openapi.json) | OpenAPI 3.0 specification (source of truth) |
| [contracts/GATEWAY_ROUTING.md](contracts/GATEWAY_ROUTING.md) | API Gateway routing table and architecture |
| [contracts/frontend-models.ts](contracts/frontend-models.ts) | TypeScript interface definitions for all DTOs |
| [contracts/proxy.conf.json](contracts/proxy.conf.json) | Angular dev proxy configuration reference |
| [contracts/README.md](contracts/README.md) | Contract documentation overview |

## AI Agent Documentation

The `.windsurf/` directory (at project root) contains internal documentation used during AI-assisted development:

- **Rules** — Coding standards, constraints, and definition of done
- **Plans** — Implementation phase plans (all completed)
- **Specifications** — Architecture specs, UI specs, agentic coding rules
- **Prompts** — Reusable prompts for AI agents

This documentation is preserved for transparency about the AI-assisted development process.

## Quick Links

- [Main README](../README.md) — Project overview, quick start, usage guide
- [LICENSE](../LICENSE) — MIT License
