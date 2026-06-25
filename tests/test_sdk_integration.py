from sdk.tracker import ExperimentTracker

tracker = (
    ExperimentTracker()
)

run = tracker.start_run(
    "SDK_Test"
)

run_id = run["run_id"]

tracker.log_param(
    run_id,
    "learning_rate",
    0.001
)

tracker.log_metric(
    run_id,
    "accuracy",
    0.95
)

tracker.end_run(
    run_id
)

print("SDK Test Success")