# 🚀 MLOps Experiment Tracker

A production-inspired MLOps Experiment Tracking Platform built with **Flask, SQLAlchemy, PostgreSQL (Neon), Cloudinary, and React with 3D Visualizations**.

This platform enables Machine Learning engineers and Data Scientists to track experiments, log parameters and metrics, manage artifacts in the cloud, register models, compare runs, and monitor model performance through an interactive, modern dashboard with 3D graphics and theme support.

---

## ✨ Features

### ✅ User Authentication & Security
- Secure user registration and login using JWT authentication
- Password hashing with Bcrypt
- Protected frontend routes and session management

### ✅ Project Management
- Organize runs and experiments across multiple projects
- Dynamic project switcher and project-level summary stats

### ✅ Experiment Tracking
- Start, log, and end experiment runs
- Track run status (`Running`, `Finished`, `Failed`)
- Automatic timestamps and execution metadata
- Detailed run history and breakdown

### ✅ Parameter & Metric Logging
- Log hyperparameter configurations
- Continuous metric logging (e.g., loss, accuracy over epochs)
- Visual metric charts and progress indicators
- Comparative metric views across runs

### ✅ Artifact Management & Cloud Storage
- Cloud artifact storage integrated with Cloudinary
- Upload model files, plots, datasets, and check logs
- Download artifacts with version control and checksum support

### ✅ Model Registry & Leaderboards
- Register trained models with stage transitions (`Development`, `Staging`, `Production`)
- Promote or rollback production model versions
- Performance leaderboards based on evaluation metrics

### ✅ Experiment Comparison & Analytics
- Multi-run comparison side-by-side
- Automatic selection and highlighting of best-performing runs
- Analytics charts (Status distributions, accuracy comparisons, top models)

### ✅ Modern 3D Interactive React Dashboard
- Built with React 19, Tailwind CSS, Chart.js, and Three.js / React Three Fiber
- Interactive 3D visual scenes and responsive UI components
- Light / Dark theme support and custom animations

### ✅ Python SDK
- Lightweight SDK to integrate into Python ML workflows easily
- Log parameters, metrics, and upload artifacts programmatically

---

# 🏗️ Architecture

```
                 React Dashboard (3D & Tailwind)
                        │
                 Axios REST API (JWT Auth)
                        │
                  Flask Backend
                        │
        ┌───────────────┼───────────────┐
        │               │               │
     Routes         Services        Python SDK
        │               │
        └───────────────┼───────────────┘
                        │
                 SQLAlchemy ORM
                 ┌──────┴──────┐
                 │             │
          Neon PostgreSQL  Cloudinary
```

---

# 📂 Project Structure

```
mlops-tracker/

├── backend/
│   ├── app.py
│   ├── config.py
│   ├── create_tables.py
│   ├── models/           # User, Project, Run, Metric, Parameter, Artifact, ModelRegistry
│   ├── routes/           # Auth, Projects, Runs, Parameters, Metrics, Artifacts, Registry, Dashboard
│   ├── services/         # Cloudinary & Business Logic
│   ├── sdk/              # Python SDK Tracker
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # 3D Scenes, Charts, Modals, Navigation
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── pages/        # Login, Projects, Dashboard, Runs, Artifacts, Registry, Compare
│   │   ├── services/     # Axios API Client
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
│
├── README.md
└── LICENSE
```

---

# 🛠️ Tech Stack

## Backend
- **Framework:** Python, Flask
- **Database ORM:** SQLAlchemy
- **Database:** PostgreSQL (Hosted on Neon)
- **Cloud Storage:** Cloudinary
- **Authentication:** PyJWT, Bcrypt

## Frontend
- **Library:** React 19, React Router DOM
- **Styling:** Tailwind CSS, React Icons
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Charts:** Chart.js, `react-chartjs-2`
- **HTTP Client:** Axios

## Python SDK
- Published / Installable Python SDK for experiment tracking from Jupyter notebooks or training scripts.

---

# 📊 Database Schema

The database contains the following tables:
- **Users**: User authentication and account profiles
- **Projects**: Project containers for experiment organization
- **Runs**: Individual experiment run executions
- **Parameters**: Hyperparameter key-value logs per run
- **Metrics**: Metric key-value logs over time/epochs per run
- **Artifacts**: File assets and model weights (Cloudinary metadata & URLs)
- **Model Registry**: Registered model versions and stage deployments

---

# 🔌 REST API Endpoints

### Auth
- `POST /auth/register` - User Registration
- `POST /auth/login` - User Login

### Projects
- `GET /projects` - List all projects
- `POST /projects/create` - Create a project
- `PUT /projects/<id>` - Update project
- `DELETE /projects/<id>` - Delete project

### Dashboard & Analytics
- `GET /dashboard/summary` - Project summary statistics
- `GET /dashboard/recent-runs` - Recent experiment runs
- `GET /dashboard/analytics` - Aggregated charts data

### Runs
- `POST /runs/start` - Start run
- `POST /runs/end` - End run
- `GET /runs/project/<project_id>` - Get runs by project
- `GET /runs/<run_id>` - Get run details
- `POST /runs/compare` - Compare multiple runs
- `GET /runs/project/<project_id>/best` - Fetch best run by metric

### Parameters & Metrics
- `POST /parameters/log` & `GET /parameters/run/<run_id>`
- `POST /metrics/log` & `GET /metrics/run/<run_id>`

### Artifacts
- `POST /artifacts/upload` - Upload artifact to Cloudinary
- `GET /artifacts/run/<run_id>` - List artifacts for a run
- `GET /artifacts/download/<artifact_id>` - Get artifact download link
- `DELETE /artifacts/<artifact_id>` - Delete artifact

### Model Registry
- `POST /registry/register` - Register a model
- `POST /registry/<id>/promote` - Promote model stage
- `POST /registry/<id>/rollback` - Rollback model stage
- `GET /registry/project/<project_id>` - List registered models
- `GET /registry/project/<project_id>/leaderboard/<model_name>` - Model leaderboard

---

# 🐍 Python SDK Example

```python
from sdk.tracker import ExperimentTracker

tracker = ExperimentTracker(api_url="http://127.0.0.1:5000", project_id=1)

tracker.start_run("ResNet50 Training")

tracker.log_param("learning_rate", 0.001)
tracker.log_param("epochs", 20)
tracker.log_param("batch_size", 32)

tracker.log_metric("accuracy", 0.96)
tracker.log_metric("loss", 0.11)

tracker.log_artifact("models/best_model.pth")

tracker.end_run()
```

---

# 🚀 Getting Started (Local Development)

## Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **PostgreSQL Database** (or Neon Postgres URI)

---

## 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your credentials
# (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY, CLOUDINARY_*)

# Initialize database tables
python create_tables.py

# Run the Flask development server
python app.py
```

Backend will run on `http://127.0.0.1:5000`.

---

## 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

Frontend will run on `http://localhost:3000`.

---

# 📌 Project Status

| Module | Status |
|---------|--------|
| Backend APIs | ✅ Complete |
| Database & ORM (PostgreSQL) | ✅ Complete |
| User Authentication (JWT) | ✅ Complete |
| Project Management | ✅ Complete |
| Experiment Tracking | ✅ Complete |
| Parameter & Metric Logging | ✅ Complete |
| Cloud Artifact Storage (Cloudinary) | ✅ Complete |
| Model Registry & Leaderboards | ✅ Complete |
| Python SDK | ✅ Complete |
| Modern 3D React Dashboard | ✅ Complete |

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Mohd Altamash**
- GitHub: [https://github.com/Altamash009](https://github.com/Altamash009)
