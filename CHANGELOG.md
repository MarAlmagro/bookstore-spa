# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Angular 21.1.2
- Authentication module (login, register, logout)
- Catalog module (book list, detail, search, filters)
- Cart module (cart view, checkout)
- Orders module (order list, order detail)
- Internationalization (English, Spanish)
- Dark mode theme toggle
- Responsive design (mobile, tablet, desktop)
- Unit tests with Jest (279 tests)
- E2E tests with Playwright
- Docker containerization with Nginx
- Comprehensive documentation

### Security
- JWT authentication with token refresh
- HTTP interceptors for auth and error handling
- No XSS vulnerabilities

## [0.1.0] - 2026-03-10

### Added
- Initial release
- Core features: auth, catalog, cart, orders
- Full documentation suite

[Unreleased]: https://github.com/MarAlmagro/bookstore-spa/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/MarAlmagro/bookstore-spa/releases/tag/v0.1.0
