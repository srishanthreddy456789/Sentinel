# SENTINEL Tests

## Overview

The `tests/` directory contains automated tests that help verify the correctness, reliability, and maintainability of SENTINEL.

## Testing Objectives

- Validate individual functions and modules.
- Verify API and database integration.
- Test evaluation metrics and failure classification.
- Check diagnosis and remediation workflows.
- Detect regressions in model evaluation behavior.
- Validate error handling and edge cases.

## Suggested Test Categories

### Unit Tests

Test individual functions, classes, evaluation metrics, validators, and utility methods in isolation.

### Integration Tests

Verify interactions between API routes, persistence, provider adapters, and AI components.

### Evaluation Regression Tests

Use fixed test cases and expected outcomes to detect changes in evaluation behavior. Track false positives and false negatives where ground-truth labels exist.

### Healing Verification Tests

Check that candidate remediations are compared with a baseline and that failed candidates are not promoted.

## Running Tests

Use the test runner and configuration declared by the project.

For a Python project configured with pytest:

```bash
python -m pytest
```

Run a specific test file with:

```bash
python -m pytest tests/path_to_test.py
```

Replace the example path with an existing test file.

## Test Quality Guidelines

- Cover normal cases, edge cases, and error paths.
- Use deterministic fixtures where possible.
- Mock external services in unit tests.
- Keep integration tests isolated from production data.
- Avoid making tests depend on paid APIs or credentials.
- Use explicit expected outcomes rather than checking only that code executes.

## Continuous Integration

If CI is configured, document how tests run in the automated workflow and which failures block a change from being merged.

## Current Status

List the actual test suites, their execution commands, and known coverage gaps.

## Related Documentation

- [Backend](../backend/README.md)
- [AI Engine](../ai/README.md)
- [GitHub Workflows](../.github/workflows/README.md)
