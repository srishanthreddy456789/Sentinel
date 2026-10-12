# SENTINEL Data

## Overview

The `data/` directory stores datasets and other data assets used for evaluation, testing, benchmarking, and development.

## Responsibilities

- Organize evaluation datasets and test examples.
- Store reference answers and expected outcomes where applicable.
- Support reproducible model evaluations.
- Separate development data from benchmark data.
- Maintain dataset documentation and provenance.

## Suggested Organization

```text
data/
├── README.md
├── datasets/
├── golden/
├── samples/
└── benchmarks/
```

This is a suggested structure, not a requirement. Keep the existing repository structure if it differs.

## Dataset Guidelines

Each dataset should document:

- Dataset name and purpose.
- Source and license, where applicable.
- Number and type of examples.
- Expected output or reference evidence.
- Version and update history.
- Known limitations.

Avoid storing API keys, personal information, or sensitive production requests in datasets.

## Evaluation Data Quality

Use representative examples covering correct answers, incorrect answers, unsupported claims, edge cases, and different response lengths.

Keep test and benchmark data consistent across baseline and candidate evaluations. Avoid using evaluation labels to modify a candidate and then reporting performance on those same examples as an independent test.

## Dataset Versioning

If DVC is configured, document the relevant commands and remote storage configuration. Otherwise, use the versioning approach actually supported by the repository.

## Current Status

List the datasets that currently exist, their formats, and whether they are sample, development, or benchmark data.

## Related Documentation

- [AI Engine](../ai/README.md)
- [Research](../research/README.md)
- [Tests](../tests/README.md)
