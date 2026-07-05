from models.project import Project


def create_project(db, current_user, data):

    existing_project = (
        db.query(Project)
        .filter(
            Project.user_id == current_user.user_id,
            Project.project_name == data["project_name"]
        )
        .first()
    )

    if existing_project:
        return {
            "error": "You already have a project with this name."
        }, 409

    project = Project(
        user_id=current_user.user_id,
        project_name=data["project_name"],
        description=data.get("description"),
        framework=data.get("framework"),
        task_type=data.get("task_type"),
        status="Active"
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "message": "Project created successfully.",
        "project": {
            "project_id": project.project_id,
            "project_name": project.project_name,
            "description": project.description,
            "framework": project.framework,
            "task_type": project.task_type,
            "status": project.status,
            "created_at": project.created_at
        }
    }, 201

# Function to get all projects for the current user
def get_projects(db, current_user):

    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.user_id)
        .order_by(Project.last_updated.desc())
        .all()
    )

    result = []

    for project in projects:

        result.append({
            "project_id": project.project_id,
            "project_name": project.project_name,
            "description": project.description,
            "framework": project.framework,
            "task_type": project.task_type,
            "status": project.status,
            "created_at": project.created_at,
            "last_updated": project.last_updated
        })

    return result, 200

# Function to get a specific project by its ID for the current user
def get_project_by_id(db, current_user, project_id):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == project_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if not project:

        return {
            "error": "Project not found."
        }, 404

    return {
        "project_id": project.project_id,
        "project_name": project.project_name,
        "description": project.description,
        "framework": project.framework,
        "task_type": project.task_type,
        "status": project.status,
        "created_at": project.created_at,
        "last_updated": project.last_updated
    }, 200

# Function to update a specific project by its ID for the current user
def update_project(db, current_user, project_id, data):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == project_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if not project:

        return {
            "error": "Project not found."
        }, 404

    if "project_name" in data:
        duplicate = (
            db.query(Project)
            .filter(
                Project.user_id == current_user.user_id,
                Project.project_name == data["project_name"],
                Project.project_id != project_id
            )
            .first()
        )

        if duplicate:
            return {
                "error": "Project name already exists."
            }, 409

        project.project_name = data["project_name"]

    if "description" in data:
        project.description = data["description"]

    if "framework" in data:
        project.framework = data["framework"]

    if "task_type" in data:
        project.task_type = data["task_type"]

    if "status" in data:
        project.status = data["status"]

    db.commit()
    db.refresh(project)

    return {
        "message": "Project updated successfully.",
        "project": {
            "project_id": project.project_id,
            "project_name": project.project_name,
            "description": project.description,
            "framework": project.framework,
            "task_type": project.task_type,
            "status": project.status,
            "last_updated": project.last_updated
        }
    }, 200

# Function to delete a specific project by its ID for the current user
def delete_project(db, current_user, project_id):

    project = (
        db.query(Project)
        .filter(
            Project.project_id == project_id,
            Project.user_id == current_user.user_id
        )
        .first()
    )

    if not project:

        return {
            "error": "Project not found."
        }, 404

    db.delete(project)
    db.commit()

    return {
        "message": "Project deleted successfully."
    }, 200