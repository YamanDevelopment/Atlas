from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from classes import Professor
from datetime import datetime
from beanie import init_beanie

async def main():
    # --- 1. Database Connection and Initialization ---
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    database = client.university_db # Your database name

    # Initialize Beanie with the Professor document
    await init_beanie(database=database, document_models=[Professor])
    print("Beanie initialized successfully.")
