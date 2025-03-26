import os
from google import genai

# Define the function declaration for the model
weather_function = {
    "name": "get_current_temperature",
    "description": "Gets the current temperature for a given location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city name, e.g. San Francisco",
            },
        },
        "required": ["location"],
    },
}

# Configure the client and tools
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
tools = genai.types.Tool(function_declarations=[weather_function])

from google.genai import types

tool_config = types.ToolConfig(
    function_calling_config=types.FunctionCallingConfig(
        mode="ANY", allowed_function_names=["get_current_temperature"]
    )
)

config = types.GenerateContentConfig(
    temperature=0,
    tools=[tools],  # not defined here.
    tool_config=tool_config,
)
