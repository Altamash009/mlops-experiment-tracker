from sdk.tracker import ExperimentTracker

tracker = ExperimentTracker()

tracker.start_run("SDK_V2")

tracker.log_param(
    "learning_rate",
    0.001
)

tracker.log_metric(
    "accuracy",
    0.95
)

tracker.log_artifact(
    r"C:\Users\Noor Afshan\Documents\mlops-tracker\tests\sdk_sample.txt"
)

tracker.end_run()

print("SDK V2 Passed")