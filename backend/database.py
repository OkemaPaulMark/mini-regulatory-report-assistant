from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./reports.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define the Report model
Base = declarative_base()

#pydantic model for the report
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    drug = Column(String, index=True)
    adverse_events = Column(String)   # store as comma-separated
    severity = Column(String)
    outcome = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)
