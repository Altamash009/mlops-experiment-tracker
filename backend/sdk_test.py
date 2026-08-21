from sdk.tracker import ExperimentTracker

tracker = ExperimentTracker(
    "http://127.0.0.1:5000"
)

# 1. Login
tracker.login(
    email="ansarialtu45@gmail.com",
    password="9555668042"
)

# 2. Select project
tracker.set_project(
    project_name="HerbAI"
)

# 3. Start run
run_result = tracker.start_run(
    run_name="SDK Test Run",
    notes="Testing complete SDK workflow"
)

run_id = run_result["run"]["run_id"]

# 4. Log parameters
tracker.log_param(
    "learning_rate",
    0.001
)

tracker.log_param(
    "batch_size",
    32
)

# 5. Log metrics
tracker.log_metric(
    "accuracy",
    0.92,
    step=1
)

tracker.log_metric(
    "accuracy",
    0.96,
    step=2
)

tracker.log_metric(
    "loss",
    0.45,
    step=1
)

tracker.log_metric(
    "loss",
    0.21,
    step=2
)

# 7. End run
tracker.end_run()

# 8. Register completed run
tracker.register_model_from_run(
    run_id=run_id,
    model_name="SDK Test Model",
    description="Registered through SDK"
)