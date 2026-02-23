import models, database

print("Creating database tables...")
models.Base.metadata.create_all(bind=database.engine)
print("Tables created successfully.")
