# SENTINEL Documentation

## Overview

The `docs/` directory contains technical documentation that helps developers understand, operate, and maintain SENTINEL.

## Documentation Areas

Depending on the files available, this directory may document:

- System architecture.
- Installation and development setup.
- API contracts.
- Database schema and migrations.
- AI evaluation methodology.
- Diagnosis and healing workflows.
- Security and configuration.
- Troubleshooting and release procedures.
- Research methodology and limitations.

## Documentation Principles

- Keep documentation consistent with the current source code.
- Use diagrams to explain complex component interactions.
- Provide tested commands and realistic examples.
- Link to the relevant implementation files.
- Document breaking changes and migration steps.
- Clearly distinguish existing behavior from planned functionality.

## Architecture Documentation

Architecture documentation should describe the desktop application, backend API, AI modules, persistence layer, and model-provider integrations, including how requests move between them.

## API Documentation

Document endpoint methods, paths, input schemas, response schemas, error behavior, and authentication requirements where applicable.

## Contribution Guidelines

When changing application behavior, update the relevant documentation and examples. Avoid duplicating the full root README in every technical document.

## Current Status

List the documentation files that actually exist and identify any important gaps.

## Related Documentation

- [Root README](../README.md)
- [Backend](../backend/README.md)
- [AI Engine](../ai/README.md)
