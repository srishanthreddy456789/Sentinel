# SENTINEL Scripts

## Overview

The `scripts/` directory contains utility scripts used to automate development, testing, evaluation, data management, and maintenance tasks.

## Responsibilities

Depending on the implemented scripts, this directory may support:

- Development environment setup.
- Backend startup and shutdown.
- Dataset preparation and validation.
- Evaluation suite execution.
- Benchmarking and result analysis.
- Database maintenance.
- Release preparation.

## Usage

Run each script using its documented interpreter and arguments. For Python scripts, an example invocation is:

```bash
python scripts/<script_name>.py --help
```

This command is appropriate only for scripts that support a `--help` argument.

## Script Development Guidelines

- Keep scripts focused on a clearly defined task.
- Validate command-line arguments.
- Return meaningful exit codes.
- Report errors clearly.
- Avoid hardcoded secrets and machine-specific paths.
- Make destructive operations explicit.
- Prefer repeatable and idempotent operations where possible.

## Testing

Test scripts with valid inputs, invalid inputs, missing dependencies, and relevant error conditions. Use temporary or sample data for destructive-operation testing.

## Current Status

Maintain a list of the scripts that exist, their purpose, required arguments, and verified execution commands.
