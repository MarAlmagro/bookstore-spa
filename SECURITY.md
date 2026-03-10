# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **Email**: security@example.com
2. **Do NOT** create a public GitHub issue

We will respond within 48 hours and work with you to understand and resolve the issue.

## Security Measures

### Authentication

- **JWT Tokens**: Access tokens stored in-memory, refresh tokens in localStorage
- **Token Refresh**: Automatic refresh on 401 responses
- **Secure Transmission**: All API calls over HTTPS in production

### Data Protection

- **No Sensitive Data in localStorage**: Only refresh tokens stored
- **Input Validation**: All forms validated before submission
- **XSS Prevention**: Angular's built-in sanitization, no innerHTML usage

### HTTP Security Headers

Production nginx configuration includes:

- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS filter
- `Content-Security-Policy` - Restricts resource loading
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info

### Dependencies

- Regular dependency updates via Dependabot
- npm audit run in CI pipeline
- No known vulnerable dependencies

## Security Checklist for Contributors

- [ ] No hardcoded credentials or API keys
- [ ] No `innerHTML` or `bypassSecurityTrust*` usage
- [ ] All user input validated and sanitized
- [ ] No sensitive data logged to console
- [ ] HTTPS used for all external requests
