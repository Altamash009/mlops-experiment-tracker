# 🚀 MLOps Experiment Tracker

A production-inspired MLOps Experiment Tracking Platform built with **Flask, SQLAlchemy, PostgreSQL (Neon), and React**.

This platform enables Machine Learning engineers and Data Scientists to track experiments, log parameters and metrics, manage artifacts, register models, compare runs, and monitor model performance through a modern dashboard.

---

## ✨ Features

### ✅ Experiment Tracking
- Start and end experiment runs
- Track run status (Running, Finished, Failed)
- Automatic timestamps
- Experiment history

### ✅ Parameter Logging
- Log hyperparameters
- Retrieve parameters for any run
- Validation and duplicate handling

### ✅ Metric Logging
- Log training and evaluation metrics
- Store multiple metrics per experiment
- Compare metrics across runs

### ✅ Artifact Management
- Upload experiment artifacts
- Versioned artifacts
- Download latest artifact
- Download artifact by version
- Checksum support
- Future-ready storage abstraction (Local → S3/Cloud)

### ✅ Model Registry
- Register trained models
- Version management
- Development / Staging / Production stages
- Production promotion
- Production history
- Leaderboard based on evaluation metrics

### ✅ Experiment Comparison
- Compare multiple experiment runs
- Best run selection
- Analytics endpoints

### ✅ Python SDK
- Start experiments
- Log parameters
- Log metrics
- Upload artifacts
- End experiments

### 🚧 Dashboard (In Progress)
- React Dashboard
- Charts
- Model Registry UI
- Artifact Explorer
- Leaderboards
- Run Comparison UI

---

# 🏗️ Architecture

```
                React Dashboard
                       │
                 Axios REST API
                       │
                Flask Backend
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      Routes        Services      Python SDK
        │              │
        └──────────────┼──────────────┘
                       │
                 SQLAlchemy ORM
                       │
               Neon PostgreSQL
```

---

# 📂 Project Structure

```
mlops-experiment-tracker/

├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sdk/
│   ├── tests/
│   ├── uploads/
│   ├── artifacts_storage/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
├── README.md
├── LICENSE
└── .gitignore
```

---

# 🛠️ Tech Stack

## Backend

- Python
- Flask
- SQLAlchemy
- PostgreSQL
- Neon Database
- REST API

## Frontend

- React
- Axios
- React Router
- Chart.js

## Database

- PostgreSQL (Neon)

## SDK

- Python SDK

---

# 📊 Database Design

Current database contains the following tables:

- Runs
- Parameters
- Metrics
- Artifacts
- Model Registry

---

# 🔌 REST APIs

### Runs

- Start Run
- End Run
- Get All Runs
- Get Run by ID

### Parameters

- Log Parameters
- Get Parameters

### Metrics

- Log Metrics
- Get Metrics

### Artifacts

- Upload Artifact
- Download Latest Artifact
- Download Artifact by Version
- List Artifacts

### Model Registry

- Register Model
- Promote Model
- Production Model
- Registry History
- Leaderboard

### Analytics

- Compare Runs
- Best Run
- Experiment Statistics

---

# 🐍 Python SDK Example

```python
from sdk.tracker import ExperimentTracker

tracker = ExperimentTracker()

tracker.start_run("HerbAI")

tracker.log_param("learning_rate", 0.001)
tracker.log_param("epochs", 20)

tracker.log_metric("accuracy", 0.96)
tracker.log_metric("loss", 0.11)

tracker.log_artifact("models/best_model.pth")

tracker.end_run()
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Altamash009/mlops-experiment-tracker.git
```

---

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

Backend runs on:

```
http://127.0.0.1:5000
```

---

## Frontend

```bash
cd frontend

npm install

npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

# 📌 Current Progress

| Module | Status |
|---------|--------|
| Backend APIs | ✅ Complete |
| PostgreSQL Integration | ✅ Complete |
| Experiment Tracking | ✅ Complete |
| Parameter Logging | ✅ Complete |
| Metric Logging | ✅ Complete |
| Artifact Management | ✅ Complete |
| Model Registry | ✅ Complete |
| Python SDK | ✅ Complete |
| React Dashboard | 🚧 In Progress |
| Docker Deployment | ⏳ Planned |
| Cloud Artifact Storage | ⏳ Planned |
| Authentication | ⏳ Planned |

---

# 🌟 Future Improvements

- Docker Deployment
- AWS S3 Artifact Storage
- User Authentication
- Team Workspaces
- Role-Based Access Control
- Model Serving APIs
- Kubernetes Deployment
- CI/CD Pipeline
- Docker Compose
- Redis Caching

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Mohd Altamash**

B.Tech Computer Science (Data Science & Artificial Intelligence)

GitHub: https://github.com/Altamash009