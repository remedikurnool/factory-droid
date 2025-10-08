# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline ensures code quality, runs tests, builds applications, and deploys to production environments.

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Code Quality Checks
- ESLint validation (backend, frontend, admin)
- Prettier formatting checks
- Runs on all PRs and pushes

#### Backend Tests
- Unit tests with Jest
- Code coverage reporting
- MongoDB and Redis services for integration tests
- Coverage uploaded to Codecov
- **Minimum Coverage:** 70%

#### Build Verification
- Backend (NestJS) build
- Frontend (Next.js) build
- Admin panel (Next.js) build
- Artifacts uploaded for deployment

#### Security Scanning
- `pnpm audit` for dependency vulnerabilities
- Trivy vulnerability scanner
- Results uploaded to GitHub Security tab

**Environment Variables Required:**
```env
NODE_VERSION=20.x
PNPM_VERSION=8
```

### 2. Production Deployment (`.github/workflows/deploy-production.yml`)

**Triggers:**
- Push to `main` branch
- Git tags matching `v*.*.*`
- Manual trigger via workflow_dispatch

**Deployment Targets:**
- **Backend:** Railway/AWS EC2 (configurable)
- **Frontend:** Vercel (configurable)
- **Admin Panel:** Vercel (configurable)

**Required Secrets:**
```
PRODUCTION_DATABASE_URL
PRODUCTION_API_URL
RAILWAY_TOKEN (or deployment platform token)
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_FRONTEND_PROJECT_ID
VERCEL_ADMIN_PROJECT_ID
SLACK_WEBHOOK (optional)
```

**Post-Deployment:**
- Health checks
- Slack notifications
- GitHub releases for tagged versions

### 3. PR Validation (`.github/workflows/pr-checks.yml`)

**Triggers:**
- Pull request opened/synchronized/reopened

**Checks:**
- Semantic PR title validation
- PR description length check
- Automatic size labeling
- File-based auto-labeling
- Welcome comment on new PRs

**PR Title Format:**
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
Example: feat(backend): add Razorpay payment integration
```

### 4. CodeQL Security Analysis (`.github/workflows/codeql-analysis.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Weekly schedule (Sundays at 00:00 UTC)

**Analysis:**
- JavaScript/TypeScript security scanning
- Security-extended queries
- Results uploaded to GitHub Security

## Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for features

### Feature Branches
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### Workflow
1. Create feature branch from `develop`
2. Implement changes
3. Push and create PR to `develop`
4. CI runs automatically
5. After approval, merge to `develop`
6. Create PR from `develop` to `main` for production release
7. Tag release with version (e.g., `v1.0.0`)
8. Automatic deployment to production

## Status Badges

Add these badges to your README.md:

```markdown
[![CI Pipeline](https://github.com/remedikurnool/factory-droid/actions/workflows/ci.yml/badge.svg)](https://github.com/remedikurnool/factory-droid/actions/workflows/ci.yml)
[![Deploy Production](https://github.com/remedikurnool/factory-droid/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/remedikurnool/factory-droid/actions/workflows/deploy-production.yml)
[![CodeQL](https://github.com/remedikurnool/factory-droid/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/remedikurnool/factory-droid/actions/workflows/codeql-analysis.yml)
```

## Local Development

### Running Tests Locally
```bash
# Backend tests
cd apps/backend
pnpm test

# With coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

### Code Quality Checks
```bash
# Lint
cd apps/backend
pnpm run lint

# Format
pnpm run format

# Format check
pnpm run format -- --check
```

### Build Verification
```bash
# Backend
cd apps/backend
pnpm run build

# Frontend
cd apps/frontend
pnpm run build

# Admin
cd apps/admin
pnpm run build
```

## Caching Strategy

The pipeline uses pnpm store caching to speed up builds:
- Cache key based on `pnpm-lock.yaml` hash
- Significantly reduces installation time
- Separate caches per OS and lock file state

## Deployment Platforms

### Backend Deployment Options

#### Option 1: Railway (Recommended for quick setup)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

#### Option 2: AWS EC2
- Uncomment AWS deployment section in `deploy-production.yml`
- Configure SSH secrets
- Ensure PM2 is installed on server

#### Option 3: Docker + Your Platform
```dockerfile
# Add Dockerfile for backend
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm run build
CMD ["node", "dist/main.js"]
```

### Frontend Deployment Options

#### Option 1: Vercel (Recommended)
- Already configured in workflows
- Zero-config Next.js deployment
- Automatic previews for PRs

#### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## Environment Variables

### CI Environment Variables
Set these in GitHub repository settings → Secrets and Variables → Actions:

#### Production Secrets
```
PRODUCTION_DATABASE_URL=mongodb://...
PRODUCTION_API_URL=https://api.onemedi.com
JWT_SECRET=<strong-secret>
RAZORPAY_KEY_ID=<your-key>
RAZORPAY_KEY_SECRET=<your-secret>
REDIS_URL=redis://...
```

#### Deployment Secrets
```
RAILWAY_TOKEN=<railway-token>
VERCEL_TOKEN=<vercel-token>
VERCEL_ORG_ID=<org-id>
VERCEL_FRONTEND_PROJECT_ID=<project-id>
VERCEL_ADMIN_PROJECT_ID=<project-id>
```

#### Optional Secrets
```
SLACK_WEBHOOK=<webhook-url>
CODECOV_TOKEN=<codecov-token>
SENTRY_DSN=<sentry-dsn>
```

## Monitoring & Alerts

### Build Notifications
- GitHub notifications for failed builds
- Optional Slack notifications on deployment
- Email notifications (GitHub settings)

### Security Alerts
- Dependabot for dependency updates
- CodeQL security scanning
- Trivy vulnerability scanning
- GitHub Security Advisories

## Troubleshooting

### Common Issues

#### 1. Tests Failing in CI but Passing Locally
**Cause:** Different Node versions or missing services
**Solution:**
```bash
# Match CI Node version
nvm use 20

# Run with CI environment
NODE_ENV=test pnpm test
```

#### 2. Build Failures
**Cause:** TypeScript errors or missing dependencies
**Solution:**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript
pnpm run build
```

#### 3. Deployment Failures
**Cause:** Missing environment variables or secrets
**Solution:**
- Verify all required secrets are set in GitHub
- Check deployment platform status
- Review deployment logs

## Performance Optimization

### Build Times
- **Current:** ~5-8 minutes for full pipeline
- **Optimized with caching:** ~3-5 minutes
- Parallel job execution for faster feedback

### Cost Optimization
- Use matrix strategy sparingly
- Cache dependencies aggressively
- Set artifact retention to 7 days
- Use `continue-on-error` for non-critical jobs

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Minimal permissions** - Use least privilege for tokens
3. **Dependency scanning** - Automated with Dependabot
4. **Code scanning** - CodeQL runs weekly
5. **Audit logs** - Review deployment history regularly

## Maintenance

### Updating Workflows
1. Test changes in feature branch
2. Verify with test PR
3. Merge to develop first
4. Deploy to production after validation

### Dependency Updates
```bash
# Update all dependencies
pnpm update --latest

# Update specific package
pnpm update <package-name>

# Update GitHub Actions
# Use Dependabot or renovate bot
```

## Future Enhancements

### Planned Improvements
- [ ] E2E testing with Playwright
- [ ] Performance testing with Lighthouse
- [ ] Automated database backups before deployment
- [ ] Blue-green deployment strategy
- [ ] Rollback automation
- [ ] Multi-region deployment
- [ ] Canary releases

## Support

For CI/CD issues:
1. Check GitHub Actions logs
2. Review this documentation
3. Check deployment platform status
4. Contact DevOps team

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [pnpm Documentation](https://pnpm.io/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

**Last Updated:** October 8, 2025  
**Version:** 1.0.0  
**Maintained by:** Factory Droid CI/CD Team
