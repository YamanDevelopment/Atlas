import asyncio
from datetime import datetime
from typing import List, Optional

from beanie import Document, Link, init_beanie, TimeStampedDocument
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import Field, EmailStr, HttpUrl, validator
from pymongo import IndexModel, TEXT

# --- Prerequisite: Define the Tag document that Lab references ---
# Beanie uses Link[Document] for relationships.
class Tag(Document):
    id: int = Field(..., description="Custom numeric ID for the tag")
    name: str
    class Settings:
        name = "tags"
        # In a real scenario with a custom numeric ID, you'd want it to be unique
        indexes = [
            IndexModel([("id", 1)], unique=True),
            IndexModel([("name", 1)], unique=True),
        ]

# --- Main Lab Document Definition ---
# We inherit from TimeStampedDocument to get `created_at` and `updated_at` fields automatically.
class Lab(Document):
    """A Pydantic-based Beanie model for a research lab."""

    # We use a separate field for the numeric ID to not conflict with Beanie's `id` (_id)
    lab_id: int = Field(..., description="Custom required and unique numeric ID")
    name: str = Field(
        ...,
        min_length=2,
        max_length=200,
        pattern=r"^[a-zA-Z0-9\s'&().-]+$",
    )
    url: Optional[HttpUrl] = None

    # Link is Beanie's way of creating a reference, similar to `ref` in Mongoose
    tags: List[Link[Tag]] = []

    description: str = Field(..., min_length=10, max_length=2000)

    department: str = Field(..., min_length=2, max_length=100)

    principal_investigator: str = Field(
        ...,
        min_length=2,
        max_length=100,
        pattern=r"^[a-zA-Z\s'-.,]+$",
    )

    location: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[EmailStr] = None
    accepting_students: bool = True
    research_areas: List[str] = []
    tags: List[Tag] = []
    
    # Use a Pydantic validator for custom logic on a field
    @validator("research_areas")
    def validate_research_areas_length(cls, areas):
        for area in areas:
            if not (2 <= len(area.strip()) <= 100):
                raise ValueError("Each research area must be between 2 and 100 characters")
        return areas

    class Settings:
        name = "labs"
        # Define indexes, including the text index for searching
        indexes = [
            IndexModel([("lab_id", 1)], unique=True),
            IndexModel(
                [
                    ("name", TEXT),
                    ("description", TEXT),
                    ("department", TEXT),
                    ("research_areas", TEXT),
                ],
                name="lab_text_index",
            ),
        ]

# --- Example Async Usage ---
async def main():
    # 1. Connect to MongoDB and initialize Beanie
    # Replace with your connection details
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    database = client.university_db
    
    # Pass all your Document models to init_beanie
    await init_beanie(database=database, document_models=[Lab, Tag])
    print("Beanie initialized successfully.")

    # 2. Create a new lab document
    neuro_lab = Lab(
        lab_id=101,
        name="Cognitive Neuroscience Lab",
        description="Exploring the neural underpinnings of human cognition and memory.",
        department="Psychology and Brain Sciences",
        principal_investigator="Dr. Eleanor Vance",
        location="Wexler Building, Room 303",
        email="evance-lab@university.edu",
        research_areas=["fMRI", "Cognitive Mapping", "Memory Consolidation"],
    )

    # 3. Save it to the database (all DB operations are async)
    try:
        await neuro_lab.insert()
        print(f"\nCreated Lab: '{neuro_lab.name}' with ID: {neuro_lab.id}")
    except Exception as e:
        print(f"\nCould not create lab. It might already exist. Error: {e}")

    # 4. Find a document
    found_lab = await Lab.find_one(Lab.lab_id == 101)
    if found_lab:
        print(f"\nFound Lab: {found_lab.name}")
        print(f"  PI: {found_lab.principal_investigator}")
    # 5. Perform a text search
    print("\nPerforming text search for 'memory'...")
    search_results = await Lab.find(
        {"$text": {"$search": "memory"}}
    ).to_list()

    for lab in search_results:
        print(f"  - Found match: {lab.name}")


if __name__ == "__main__":
    asyncio.run(main())