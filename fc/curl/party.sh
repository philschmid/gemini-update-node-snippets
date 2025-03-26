#!/bin/bash

# =============================
# Function Declarations
# =============================

# Define disco ball function
power_disco_ball='{
  "name": "power_disco_ball",
  "description": "Powers the spinning disco ball.",
  "parameters": {
    "type": "object",
    "properties": {
      "power": {
        "type": "boolean",
        "description": "Whether to turn the disco ball on or off."
      }
    },
    "required": ["power"]
  }
}'

# Define start music function
start_music='{
  "name": "start_music",
  "description": "Play some music matching the specified parameters.",
  "parameters": {
    "type": "object",
    "properties": {
      "energetic": {
        "type": "boolean",
        "description": "Whether the music is energetic or not."
      },
      "loud": {
        "type": "boolean",
        "description": "Whether the music is loud or not."
      }
    },
    "required": ["energetic", "loud"]
  }
}'

# Define dim lights function
dim_lights='{
  "name": "dim_lights",
  "description": "Dim the lights.",
  "parameters": {
    "type": "object",
    "properties": {
      "brightness": {
        "type": "number",
        "description": "The brightness of the lights, 0.0 is off, 1.0 is full."
      }
    },
    "required": ["brightness"]
  }
}'

# Implementation functions
power_disco_ball_impl() {
  local power=$1
  local status
  if [ "$power" = "true" ]; then
    status="Disco ball powered on"
  else
    status="Disco ball powered off"
  fi
  echo "{\"status\": \"$status\"}"
}

start_music_impl() {
  local energetic=$1
  local loud=$2
  local music_type
  local volume
  
  if [ "$energetic" = "true" ]; then
    music_type="energetic"
  else
    music_type="chill"
  fi
  
  if [ "$loud" = "true" ]; then
    volume="loud"
  else
    volume="quiet"
  fi
  
  echo "{\"music_type\": \"$music_type\", \"volume\": \"$volume\"}"
}

dim_lights_impl() {
  local brightness=$1
  echo "{\"brightness\": $brightness}"
}

# =============================
# API Configuration
# =============================

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY environment variable is not set."
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed. Please install jq."
  exit 1
fi

# API configuration
API_URL="https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"
API_KEY="$GEMINI_API_KEY"

# =============================
# Example 1: Force function calling
# =============================

echo "Example 1: Forced function calling"

# Package all function declarations into a JSON array
function_declarations="[$power_disco_ball, $start_music, $dim_lights]"

# Create request payload with function declarations and forced function calling
REQUEST_PAYLOAD=$(cat << EOF
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Turn this place into a party!"
        }
      ]
    }
  ],
  "tools": [
    {
      "functionDeclarations": $function_declarations
    }
  ],
  "generationConfig": {
    "automaticFunctionCalling": {"disable": true},
    "toolConfig": {
      "functionCallingConfig": {
        "mode": "any"
      }
    }
  }
}
EOF
)

# Send request to Gemini API
RESPONSE=$(curl -s -X POST "$API_URL?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

# Extract function calls
FUNCTION_CALLS=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.functionCall != null) | .functionCall')

# Process each function call
if [ -n "$FUNCTION_CALLS" ]; then
  # Count the number of function calls
  NUM_CALLS=$(echo "$FUNCTION_CALLS" | jq -r '. | length')
  
  # Process and print each function call
  echo "$FUNCTION_CALLS" | jq -c '.' | while read -r FUNCTION_CALL; do
    NAME=$(echo "$FUNCTION_CALL" | jq -r '.name')
    ARGS=$(echo "$FUNCTION_CALL" | jq -r '.args')
    
    # Print function and args
    ARGS_FORMATTED=$(echo "$ARGS" | jq -r 'to_entries | map(.key + "=" + (.value | tostring)) | join(", ")')
    echo "$NAME($ARGS_FORMATTED)"
  done
else
  echo "No function calls were made."
fi

# =============================
# Example 2: Automatic function calling
# =============================

echo -e "\nExample 2: Automatic function calling"

# Create request payload with function declarations but no forced function calling
REQUEST_PAYLOAD=$(cat << EOF
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Do everything you need to this place into party!"
        }
      ]
    }
  ],
  "tools": [
    {
      "functionDeclarations": $function_declarations
    }
  ]
}
EOF
)

# Send request to Gemini API
RESPONSE=$(curl -s -X POST "$API_URL?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

# Extract text response
TEXT_RESPONSE=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.text != null) | .text')
echo "$TEXT_RESPONSE"

# Extract function calls
FUNCTION_CALLS=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.functionCall != null) | .functionCall')

# Process each function call
if [ -n "$FUNCTION_CALLS" ]; then
  echo -e "\nFunctions called:"
  echo "$FUNCTION_CALLS" | jq -c '.' | while read -r FUNCTION_CALL; do
    NAME=$(echo "$FUNCTION_CALL" | jq -r '.name')
    ARGS=$(echo "$FUNCTION_CALL" | jq -r '.args')
    
    # Print function and args
    ARGS_FORMATTED=$(echo "$ARGS" | jq -r 'to_entries | map(.key + "=" + (.value | tostring)) | join(", ")')
    echo "$NAME($ARGS_FORMATTED)"
  done
fi 