#!/bin/bash

# =============================
# Function Declaration
# =============================

# Define a function that the model can call to control smart lights
function_declaration='{
  "name": "set_light_values",
  "description": "Sets the brightness and color temperature of a light.",
  "parameters": {
    "type": "object",
    "properties": {
      "brightness": {
        "type": "number",
        "description": "Light level from 0 to 100. Zero is off and 100 is full brightness"
      },
      "color_temp": {
        "type": "string",
        "enum": ["daylight", "cool", "warm"],
        "description": "Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`."
      }
    },
    "required": ["brightness", "color_temp"]
  }
}'

# This is the actual function that would be called based on the model's suggestion
set_light_values() {
  local brightness=$1
  local color_temp=$2
  
  # In a real implementation, this would control actual lights
  # For demo, we just echo the values and create a JSON response
  echo "Setting light brightness to $brightness and color temperature to $color_temp"
  
  # Return a JSON object with the set values
  echo "{\"brightness\": $brightness, \"colorTemperature\": \"$color_temp\"}"
}

# =============================
# Model Configuration
# =============================

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY environment variable is not set."
  exit 1
fi

# API configuration
API_URL="https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"
API_KEY="$GEMINI_API_KEY"

# User Prompt
PROMPT="Turn the lights down to a romantic level"

# Create request payload with function declaration
REQUEST_PAYLOAD=$(cat << EOF
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "$PROMPT"
        }
      ]
    }
  ],
  "tools": [
    {
      "functionDeclarations": [$function_declaration]
    }
  ]
}
EOF
)

# =============================
# API Call
# =============================

# Send request to Gemini API
echo "Sending request to Gemini API..."
RESPONSE=$(curl -s -X POST "$API_URL?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

# Extract function call details (using jq for JSON parsing)
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Please install jq."
  exit 1
fi

echo "Received response from Gemini API."
FUNCTION_CALL=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].functionCall')
FUNCTION_NAME=$(echo "$FUNCTION_CALL" | jq -r '.name')
ARGS=$(echo "$FUNCTION_CALL" | jq -r '.args')

echo "Function call detected: $FUNCTION_NAME"
echo "Arguments: $ARGS"

# =============================
# Function Execution
# =============================

# Extract the arguments
BRIGHTNESS=$(echo "$ARGS" | jq -r '.brightness')
COLOR_TEMP=$(echo "$ARGS" | jq -r '.color_temp')

# Execute the function
if [ "$FUNCTION_NAME" = "set_light_values" ]; then
  echo "Executing function: $FUNCTION_NAME"
  RESULT=$(set_light_values "$BRIGHTNESS" "$COLOR_TEMP")
  echo "Function execution result: $RESULT"
else
  echo "Error: Unknown function name: $FUNCTION_NAME"
  exit 1
fi

# =============================
# Create Response
# =============================

# Create a function response part
FUNCTION_RESPONSE="{
  \"name\": \"$FUNCTION_NAME\",
  \"response\": { 
    \"result\": $RESULT 
  }
}"

# Append the model's function call and the function response to create a conversation
CONVERSATION=$(cat << EOF
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "$PROMPT"
        }
      ]
    },
    {
      "role": "model",
      "parts": [
        {
          "functionCall": $FUNCTION_CALL
        }
      ]
    },
    {
      "role": "user",
      "parts": [
        {
          "functionResponse": $FUNCTION_RESPONSE
        }
      ]
    }
  ],
  "tools": [
    {
      "functionDeclarations": [$function_declaration]
    }
  ]
}
EOF
)

# Get the final response from the model
echo "Sending function response back to Gemini API..."
FINAL_RESPONSE=$(curl -s -X POST "$API_URL?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "$CONVERSATION")

# Extract and display the final text response
FINAL_TEXT=$(echo "$FINAL_RESPONSE" | jq -r '.candidates[0].content.parts[0].text')
echo ""
echo "Final response from Gemini:"
echo "$FINAL_TEXT" 