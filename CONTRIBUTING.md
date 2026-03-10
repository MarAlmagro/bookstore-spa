# Contributing to Bookstore SPA

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful and inclusive. We welcome contributions from everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/bookstore-spa.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Running Locally

```bash
npm start          # Start dev server (requires backend on port 8080)
```

For offline development, enable mock mode in `src/environments/environment.ts`:

```typescript
useMocks: true
```

### Code Style

- **TypeScript**: Follow the ESLint configuration
- **Components**: Use `ChangeDetectionStrategy.OnPush`
- **Services**: Use Observable Data Service pattern
- **No `any` types**: Define interfaces in `src/app/models/`
- **Max 300 lines**: Split large components

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(catalog): add advanced search filters
fix(auth): handle token refresh race condition
refactor(cart): simplify quantity update logic
test(orders): add E2E tests for order detail
docs: update API documentation
chore: update dependencies
```

### Testing

Before submitting a PR:

```bash
npm run lint        # Check linting
npm test            # Run unit tests
npm run e2e         # Run E2E tests (with backend or mock mode)
npm run build:prod  # Verify production build
```

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS
- Screenshots if applicable

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered

## Questions?

Open a discussion on GitHub or reach out to the maintainers.
