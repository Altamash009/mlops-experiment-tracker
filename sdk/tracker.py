import requests


class ExperimentTracker:

    def __init__(
        self,
        base_url="http://127.0.0.1:5000"
    ):

        self.base_url = base_url

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
        return response.json()
    

    def log_param(

        self,

        run_id,

        param_name,

        param_value
    ):

        response = requests.post(

            f"{self.base_url}/parameters/log",

            json={

                "run_id":
                    run_id,

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

        run_id,

        metric_name,

        metric_value
    ):

        response = requests.post(

            f"{self.base_url}/metrics/log",

            json={

                "run_id":
                    run_id,

                "metric_name":
                    metric_name,

                "metric_value":
                    metric_value
            }
        )

        response.raise_for_status()
        return response.json()
    
    def end_run(
        self,
        run_id
    ):

        response = requests.post(
            f"{self.base_url}/runs/end/{run_id}"
        )

        response.raise_for_status() 
        return response.json()