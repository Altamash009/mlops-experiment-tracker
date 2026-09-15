import os
import tempfile

import requests
import matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix


class ExperimentTracker:
    """
    Python SDK for the MLOps Tracker.

    Workflow:

        tracker = ExperimentTracker()

        tracker.login(email, password)
        tracker.set_project("HerbAI")

        tracker.start_run("EfficientNet-B0")

        tracker.log_param("epochs", 20)
        tracker.log_metric("accuracy", 0.97, step=20)

        tracker.log_artifact(
            "model.pth",
            artifact_type="model",
            description="Best model checkpoint"
        )

        tracker.log_confusion_matrix(
            y_true,
            y_pred,
            step=20
        )

        tracker.end_run()
    """

    def __init__(
        self,
        base_url="http://127.0.0.1:5000"
    ):
        self.base_url = base_url.rstrip("/")

        self.token = None
        self.user = None

        self.project_id = None
        self.project = None

        self.current_run = None

        self.session = requests.Session()

    # =========================================================
    # INTERNAL HELPERS
    # =========================================================

    def _headers(self):
        """
        Return authentication headers for protected APIs.
        """

        if self.token is None:
            raise RuntimeError(
                "Not authenticated. Call login() first."
            )

        return {
            "Authorization": f"Bearer {self.token}"
        }

    def _raise_for_api_error(self, response):
        """
        Raise a useful error message when the backend returns
        an API error.
        """

        if response.ok:
            return

        try:
            error_data = response.json()
            message = error_data.get(
                "error",
                error_data.get(
                    "message",
                    response.text
                )
            )
        except ValueError:
            message = response.text

        raise RuntimeError(
            f"API Error ({response.status_code}): {message}"
        )

    def _require_project(self):
        if self.project_id is None:
            raise RuntimeError(
                "No project selected. "
                "Call set_project() first."
            )

    def _require_run(self):
        if self.current_run is None:
            raise RuntimeError(
                "No active run. "
                "Call start_run() first."
            )

    # =========================================================
    # AUTHENTICATION
    # =========================================================

    def login(
        self,
        email,
        password
    ):
        """
        Authenticate the user and store the JWT token.
        """

        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={
                "email": email,
                "password": password
            }
        )

        self._raise_for_api_error(response)

        result = response.json()

        self.token = result["token"]
        self.user = result.get("user")

        return result

    # =========================================================
    # PROJECTS
    # =========================================================

    def set_project(
        self,
        project_name=None,
        project_id=None
    ):
        """
        Select the project for future runs.

        Examples:

            tracker.set_project(
                project_name="HerbAI"
            )

        or:

            tracker.set_project(
                project_id=3
            )
        """

        if self.token is None:
            raise RuntimeError(
                "Not authenticated. Call login() first."
            )

        if project_name is None and project_id is None:
            raise ValueError(
                "Provide either project_name or project_id."
            )

        response = self.session.get(
            f"{self.base_url}/projects",
            headers=self._headers()
        )

        self._raise_for_api_error(response)

        projects = response.json()

        selected_project = None

        for project in projects:

            if (
                project_id is not None
                and project["project_id"] == project_id
            ):
                selected_project = project
                break

            if (
                project_name is not None
                and project["project_name"] == project_name
            ):
                selected_project = project
                break

        if selected_project is None:

            if project_id is not None:
                raise ValueError(
                    f"Project with ID {project_id} "
                    "was not found."
                )

            raise ValueError(
                f"Project '{project_name}' was not found."
            )

        self.project_id = selected_project["project_id"]
        self.project = selected_project

        return selected_project

    # =========================================================
    # RUN LIFECYCLE
    # =========================================================

    def start_run(
        self,
        run_name=None,
        notes=None
    ):
        """
        Start a run inside the currently selected project.

        If run_name is omitted, the backend generates one.
        """

        self._require_project()

        if self.current_run is not None:
            raise RuntimeError(
                "A run is already active. "
                "End it before starting another run."
            )

        payload = {
            "project_id": self.project_id
        }

        if run_name is not None:
            payload["run_name"] = run_name

        if notes is not None:
            payload["notes"] = notes

        response = self.session.post(
            f"{self.base_url}/runs/start",
            headers=self._headers(),
            json=payload
        )

        self._raise_for_api_error(response)

        result = response.json()

        run = result["run"]

        self.current_run = run["run_id"]

        return result

    def end_run(
        self,
        status="COMPLETED"
    ):
        """
        End the current run.
        """

        self._require_run()

        response = self.session.post(
            f"{self.base_url}/runs/end/{self.current_run}",
            headers=self._headers(),
            json={
                "status": status
            }
        )

        self._raise_for_api_error(response)

        result = response.json()

        self.current_run = None

        return result

    # =========================================================
    # PARAMETERS
    # =========================================================

    def log_param(
        self,
        param_name,
        param_value
    ):
        """
        Log an experiment parameter.
        """

        self._require_run()

        response = self.session.post(
            f"{self.base_url}/parameters/log",
            headers=self._headers(),
            json={
                "run_id": self.current_run,
                "param_name": param_name,
                "param_value": param_value
            }
        )

        self._raise_for_api_error(response)

        return response.json()

    # =========================================================
    # METRICS
    # =========================================================

    def log_metric(
        self,
        metric_name,
        metric_value,
        step=0
    ):
        """
        Log a metric at a specific training step.
        """

        self._require_run()

        response = self.session.post(
            f"{self.base_url}/metrics/log",
            headers=self._headers(),
            json={
                "run_id": self.current_run,
                "metric_name": metric_name,
                "metric_value": metric_value,
                "step": step
            }
        )

        self._raise_for_api_error(response)

        return response.json()

    # =========================================================
    # ARTIFACTS
    # =========================================================

    def log_artifact(
        self,
        file_path,
        artifact_type="other",
        description=None
    ):
        """
        Upload a file artifact to Cloudinary-backed storage.
        """

        self._require_run()

        if not os.path.isfile(file_path):
            raise FileNotFoundError(
                f"Artifact file does not exist: {file_path}"
            )

        data = {
            "run_id": str(self.current_run),
            "artifact_type": artifact_type
        }

        if description is not None:
            data["description"] = description

        with open(file_path, "rb") as file:

            files = {
                "file": (
                    os.path.basename(file_path),
                    file
                )
            }

            response = self.session.post(
                f"{self.base_url}/artifacts/upload",
                headers=self._headers(),
                data=data,
                files=files
            )

        self._raise_for_api_error(response)

        return response.json()

    # =========================================================
    # CONFUSION MATRIX
    # =========================================================

    def log_confusion_matrix(
        self,
        y_true,
        y_pred,
        step=0,
        class_names=None,
        description=None
    ):
        """
        Generate a confusion matrix image and automatically
        upload it as an artifact.

        Parameters
        ----------
        y_true:
            Ground-truth labels.

        y_pred:
            Model predictions.

        step:
            Training/evaluation step.

        class_names:
            Optional list of class names.

        description:
            Optional artifact description.
        """

        self._require_run()

        if class_names is None:

            labels = sorted(
                set(y_true) | set(y_pred)
            )

            display_labels = labels

        else:

            labels = list(
                range(len(class_names))
            )

            display_labels = class_names

        matrix = confusion_matrix(
            y_true,
            y_pred,
            labels=labels
        )

        fig, ax = plt.subplots(
            figsize=(8, 8)
        )

        display = ConfusionMatrixDisplay(
            confusion_matrix=matrix,
            display_labels=display_labels
        )

        display.plot(
            ax=ax,
            cmap="Blues",
            colorbar=False
        )

        ax.set_title(
            f"Confusion Matrix - Step {step}"
        )

        plt.tight_layout()

        temp_path = None

        try:

            with tempfile.NamedTemporaryFile(
                suffix=".png",
                prefix=f"confusion_matrix_step_{step}_",
                delete=False
            ) as temp_file:

                temp_path = temp_file.name

            fig.savefig(
                temp_path,
                dpi=150,
                bbox_inches="tight"
            )

        finally:

            plt.close(fig)

        try:

            if description is None:

                description = (
                    f"Confusion matrix at step {step}"
                )

            return self.log_artifact(
                temp_path,
                artifact_type="image",
                description=description
            )

        finally:

            if temp_path and os.path.exists(temp_path):

                os.remove(temp_path)

    # =========================================================
    # MODEL REGISTRY
    # =========================================================

    def register_model(
        self,
        model_name,
        description=None
    ):
        """
        Register the current run's model.

        The backend requires the run to be COMPLETED.
        """

        self._require_run()

        # Registering requires a completed run.
        # Therefore this method should normally be called
        # after end_run(), using the run ID returned before
        # the run was cleared.
        raise RuntimeError(
            "Model registration is performed after a run is "
            "completed. Use register_model_from_run() with "
            "the completed run ID."
        )

    def register_model_from_run(
        self,
        run_id,
        model_name,
        description=None
    ):
        """
        Register a model produced by a completed run.
        """

        payload = {
            "run_id": run_id,
            "model_name": model_name
        }

        if description is not None:
            payload["description"] = description

        response = self.session.post(
            f"{self.base_url}/registry/register",
            headers=self._headers(),
            json=payload
        )

        self._raise_for_api_error(response)

        return response.json()

    # =========================================================
    # CONTEXT MANAGER
    # =========================================================

    def run(
        self,
        run_name=None,
        notes=None
    ):
        """
        Context-manager style run.

        Example:

            with tracker.run("EfficientNet"):

                tracker.log_param(...)
                tracker.log_metric(...)
        """

        return _RunContext(
            tracker=self,
            run_name=run_name,
            notes=notes
        )


class _RunContext:

    def __init__(
        self,
        tracker,
        run_name,
        notes
    ):

        self.tracker = tracker
        self.run_name = run_name
        self.notes = notes

    def __enter__(self):

        return self.tracker.start_run(
            run_name=self.run_name,
            notes=self.notes
        )

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback
    ):

        if self.tracker.current_run is None:
            return False

        if exc_type is None:

            self.tracker.end_run(
                status="COMPLETED"
            )

        else:

            self.tracker.end_run(
                status="FAILED"
            )

        return False