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
| [REVIEW_SUMMARY.md](REVIEW_SUMMARY.md) | Comprehensive project review |

## Improvement Plans

| Plan | Priority | Description |
|------|----------|-------------|
| [PLAN-01-CICD](plans/PLAN-01-CICD.md) | 🔴 Critical | CI/CD pipeline setup |
| [PLAN-02-TESTING](plans/PLAN-02-TESTING.md) | 🟠 High | E2E mock strategy & accessibility testing |
| [PLAN-03-PERFORMANCE](plans/PLAN-03-PERFORMANCE.md) | 🟠 High | Bundle optimization |
| [PLAN-04-SECURITY](plans/PLAN-04-SECURITY.md) | 🟡 Medium | Security hardening |
| [PLAN-05-OBSERVABILITY](plans/PLAN-05-OBSERVABILITY.md) | 🟡 Medium | Logging and monitoring |
| [PLAN-06-ACCESSIBILITY](plans/PLAN-06-ACCESSIBILITY.md) | 🟡 Medium | A11y improvements |
| [PLAN-07-DOCUMENTATION](plans/PLAN-07-DOCUMENTATION.md) | 🟢 Low | Documentation gaps |

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
