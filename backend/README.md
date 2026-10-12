# SENTINEL Backend

## Overview

The `backend/` directory contains the server-side components of SENTINEL. The backend exposes APIs for managing connected LLM providers, ingesting requests, retrieving evaluation results, and coordinating diagnosis and healing workflows.

The backend is built with **Python, FastAPI, and asynchronous request handling**.

## Responsibilities

- Expose REST APIs for the desktop application and SDK.
- Ingest and persist LLM request and response data.
- Manage connected API and model configurations.
- Retrieve dashboard, evaluation, failure, and diagnosis information.
- Coordinate evaluation and healing operations through the AI modules.
- Validate incoming requests and handle errors.
- Integrate with the database layer.

## Architecture

```text
Desktop Application / SDK
          |
          v
      FastAPI App
          |
          v
      API Routes
          |
          +---- Request Ingestion
          +---- API Management
          +---- Evaluations
          +---- Diagnosis
          +---- Healing
          |
          v
   Service / AI Modules
          |
          v
      Database Layer
```

## API Endpoints

Documented project endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/requests/ingest` | Ingest an LLM request or response |
| GET | `/api/v1/apis/` | Retrieve connected APIs |
| GET | `/api/v1/dashboard/global` | Retrieve global dashboard data |
| POST | `/api/v1/healing/trigger` | Trigger a healing operation |
| GET | `/api/v1/evaluations/` | Retrieve evaluation information |

Confirm the actual request schemas and endpoint behavior in the route implementations.

## Running the Backend

From the repository root, activate your Python environment and install the project's declared dependencies.

```bash
python -m uvicorn sentinel.app:app \
  --host 127.0.0.1 \
  --port 8000 \
  --app-dir backend
```

On Windows PowerShell, use the same command on one line if needed.

## Configuration

Configure database connections, provider credentials, and application settings through the project's supported configuration mechanism.

- Keep credentials outside source control.
- Never log raw API keys.
- Validate and sanitize incoming data.
- Use appropriate request timeouts and error handling.

## Testing

Run the backend's available tests using the repository's configured test framework. Verify API responses, input validation, persistence, and error handling.

## Current Status

Update this section after auditing the code. Distinguish implemented endpoints from mock responses, incomplete integrations, and planned functionality.

## Related Documentation

- [Root README](../README.md)
- [AI modules](../ai/README.md)
- [Tests](../tests/README.md)
