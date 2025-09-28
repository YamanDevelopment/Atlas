from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from classes import Professor
from datetime import datetime
from google.adk.runners import Runner
from beanie import init_beanie
from agent import root_agent
from types import Content, Part
from classes import Lab

# Simplified agent interaction without sessions
async def call_agent_async(query):
    """
    Call the agent with a query without using session management.
    """
    content = Content(role='user', parts=[Part(text=query)])
    
    # Create a runner without session service
    runner = Runner(agent=root_agent, app_name="OpTrack")
    
    # Run the agent directly with the content
    events = runner.run_async(new_message=content)
    
    async for event in events:
        if event.is_final_response():
            final_response = event.content.parts[0].text
            print("Agent Response: ", final_response)
            return final_response
        

async def main():
    # --- 1. Database Connection and Initialization ---
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    database = client.university_db # Your database name

    # Initialize Beanie with the Professor document
    await init_beanie(database=database, document_models=[Lab])
    print("Beanie initialized successfully.")



main()