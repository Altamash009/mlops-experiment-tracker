import requests
import os

class ExperimentTracker:

    def __init__(
        self,
        base_url="http://127.0.0.1:5000"
    ):

        self.base_url = base_url
        self.current_run = None

    def start_run(
        self,
        experiment_name
    ):

        response = requests.post(

            f"{self.base_url}/runs/start",

            json={
                "experiment_name":
                experiment_name
            }
        )

        response.raise_for_status()
        run = response.json()

        self.current_run = run["run_id"]

        return run
    

    def log_param(
        self,
        param_name,
        param_value
    ):
        if self.current_run is None:

            raise RuntimeError(
                "No active run. Call start_run() first."
            )

        response = requests.post(

            f"{self.base_url}/parameters/log",

            json={

                "run_id":
                    self.current_run,

                "param_name":
                    param_name,

                "param_value":
                    param_value
            }
        )
    
        response.raise_for_status()
        return response.json()
    

    def log_metric(
        self,
        metric_name,
        metric_value
    ):
        if self.current_run is None:

            raise RuntimeError(
                "No active run. Call start_run() first."
            )

        response = requests.post(

            f"{self.base_url}/metrics/log",

            json={

                "run_id":
                    self.current_run,

                "metric_name":
                    metric_name,

                "metric_value":
                    metric_value
            }
        )

        response.raise_for_status()
        return response.json()
    
    def log_artifact(
        self,
        file_path
    ):

        if self.current_run is None:

            raise RuntimeError(
                "No active run. Call start_run() first."
            )

        if not os.path.exists(file_path):

            raise FileNotFoundError(
                f"{file_path} does not exist."
            )

        with open(file_path, "rb") as file:

            files = {
                "file": file
            }

            data = {
                "run_id": self.current_run
            }

            response = requests.post(
                f"{self.base_url}/artifacts/upload",
                files=files,
                data=data
            )

        response.raise_for_status()

        return response.json()
    
    def end_run(self):

        if self.current_run is None:

            raise RuntimeError(
                "No active run. Call start_run() first."
            )

        response = requests.post(
            f"{self.base_url}/runs/end/{self.current_run}"
        )

        result = response.json()

        # Clear the active run only after a successful API call
        if response.status_code == 200:
            self.current_run = None

        return result
