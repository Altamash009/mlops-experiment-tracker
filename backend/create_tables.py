from models.database import Base, engine
import models

Base.metadata.create_all(bind=engine)

print("=" * 50)
print("✅ All database tables created successfully!")
print("=" * 50)