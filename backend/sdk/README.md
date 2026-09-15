# MLOps Tracker SDK

A Python SDK for interacting with the MLOps Experiment Tracker.

The SDK provides an MLflow-style interface for:

- Experiment run management
- Parameter logging
- Step-based metric logging
- Artifact uploads
- Confusion matrix logging
- Model registration
- Project-based experiment tracking

## Features

### Authentication

Authenticate against the MLOps Tracker API using JWT:

```python
from mlops_tracker import ExperimentTracker

tracker = ExperimentTracker(
    base_url="http://127.0.0.1:5000"
)

tracker.login(
    email="user@example.com",
    password="your-password"
)

## Installation

### Core SDK

```bash
pip install mlops-tracker-sdk
