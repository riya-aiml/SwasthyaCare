# Deployment Guide

**Status:** Proposed non-clinical demo deployment.

## Environments
- Local development
- Test/staging
- Demo/production-like environment

## Proposed hosting
- Frontend: Vercel or equivalent.
- Node.js API: a managed Node.js hosting service.
- Python API: a Python-compatible managed hosting service.
- Database: managed database with access restrictions and backups.
- Images: private object storage.

Providers are TBD and must be selected after evaluating region, privacy, security, cost, and operational needs.

## Deployment checklist
- Configure HTTPS.
- Store secrets in the host's secret manager/environment configuration.
- Restrict database network access.
- Enable backups and test restore.
- Configure logging and monitoring without sensitive health payloads.
- Configure CORS narrowly.
- Apply rate limits.
- Verify authorization in deployed environment.
- Use synthetic data for demo.
- Document rollback procedure.

## Environment variables
Document variable names and purpose, never actual secret values. Keep `.env.example` free of credentials.
