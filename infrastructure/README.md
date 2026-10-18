# SENTINEL Infrastructure

## Overview

The `infra/` directory contains infrastructure and deployment configuration used to develop, run, test, or distribute SENTINEL.

## Responsibilities

Depending on the implemented setup, this directory may contain:

- Container configuration.
- Service orchestration.
- Database service configuration.
- Environment and runtime configuration.
- Deployment scripts.
- Monitoring and operational configuration.

## Architecture

A typical SENTINEL development environment may include:

```text
Electron Desktop App
        |
        v
FastAPI Backend
        |
        +---- Database
        |
        +---- External LLM APIs
        |
        +---- Local LLM Runtime
```

This diagram represents the intended integration pattern; consult the actual configuration files for deployed services.

## Configuration Guidelines

- Keep secrets in environment variables or an appropriate secret manager.
- Provide an `.env.example` containing variable names and safe sample values.
- Avoid committing populated environment files.
- Pin dependencies and container versions where practical.
- Document ports, health checks, and persistent storage.

## Running Services

Document the actual startup and shutdown commands for the infrastructure configuration available in this directory.

For example, only if a Docker Compose file exists:

```bash
docker compose up --build
docker compose down
```

## Security and Reliability

Use least-privilege permissions, restrict exposed ports, configure timeouts, and persist data where necessary. Document backup and recovery procedures if supported.

## Current Status

List implemented infrastructure components and clearly identify anything that is planned but not configured.

## Related Documentation

- [Backend](../backend/README.md)
- [Root README](../README.md)
