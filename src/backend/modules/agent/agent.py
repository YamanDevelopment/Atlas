from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.tools import google_search
from classes import Lab
import random


APP_NAME = ""





async def create_lab(name: str, description: str, department: str, principal_investigator: str, **kwargs):
    """
    Create a new Lab instance for gemini to use.
    
    Args:
        lab_id (int): Unique numeric identifier for the lab
        name (str): Name of the lab (2-200 chars, alphanumeric with allowed special chars)
        description (str): Description of the lab (10-2000 chars)
        department (str): Department the lab belongs to (2-100 chars)
        principal_investigator (str): Name of the PI (2-100 chars, letters and allowed punctuation)
        **kwargs: Optional fields like url, location, email, accepting_students, research_areas, tags
    
    Returns:
        Lab: A new Lab instance configured for gemini
    """


    # Generate a random lab ID between 1000 and 9999
    lab_id = random.randint(1000, 9999)
    
    lab_data = {
        "lab_id": lab_id,
        "name": name,
        "description": description,
        "department": department,
        "principal_investigator": principal_investigator,
        "accepting_students": kwargs.get("accepting_students", True),
        "research_areas": kwargs.get("research_areas", []),
        "tags": kwargs.get("tags", [])
    }
    
    # Add optional fields if provided
    if "url" in kwargs:
        lab_data["url"] = kwargs["url"]
    if "location" in kwargs:
        lab_data["location"] = kwargs["location"]
    if "email" in kwargs:
        lab_data["email"] = kwargs["email"]
    
    lab = Lab(**lab_data)
    try:
        lab.insert()
        print(f"\nCreated Lab: '{lab.name}' with ID: {lab.id}")
    except Exception as e:
        print(f"\nCould not create lab. It might already exist. Error: {e}")
    
    return lab
    
async def find_lab(name: str):
    return Lab.find_one(Lab.name == name)


root_agent = Agent(
    name="lab_search_agent",
    model="gemini-2.0-flash",
    description=(
        "Agent to find research labs for specified research interests"
    ),
    instruction=(
        "Follow these steps to find research labs:\n"
        "1. First search the database using find_lab() with the lab name\n"
        "2. If the lab is not found in the database:\n"
        "   - Use google_search() to find information about the lab\n"
        "   - Extract relevant details. The following are a MUST: name, description, department, PI. All other info would be nice.\n" 
        "   - Create the lab using create_lab() with the found information\n"
        "3. Return the lab information to the user\n"
        "Only search for academic research labs. Do not create entries for non-academic organizations."
    ),
    tools=[find_lab, google_search, create_lab]
)


