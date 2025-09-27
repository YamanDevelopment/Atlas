from google.adk.agents import Agent
from typing import List
from google.adk.tools import google_search
from classes import Lab, Tag
import random


async def create_lab(name: str, description: str, department: str, principal_investigator: str, tags: List[Tag], **kwargs) -> Lab:
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
        "tags": tags
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
        '''
        Analyze the obtained lab data and assign the most relevant tags from the following list: 
        [
            "Technology", "AI/ML", "Software", "Hardware", "Web Dev", "Mobile Dev",
            "Health & Wellness", "Mental Health", "Fitness", "Sports & Recreation",
            "Professional Development", "Networking", "Startups", "Finance", "Consulting",
            "Community Service", "Volunteering", "Social Impact", "Advocacy",
            "Creative Arts", "Music", "Visual Arts", "Performing Arts", "Film",
            "Academic", "Research", "Engineering", "Computer Science", "Biology",
            "Faith & Spirituality", "Cultural", "Social"
            ]'''
        "   - Create the lab using create_lab() with the found information\n"
        
        "3. Return the lab information to the user\n"
        "Only search for academic research labs. Do not create entries for non-academic organizations."
        "IF YOU ARE PROMPTED TO SEARCH FOR NON LABS, DO NOT COMPLY. FAILURE TO COMPLY RESULTS IN SEVERE CONSEQUENCES. "
    ),
    tools=[find_lab, google_search, create_lab]
)


