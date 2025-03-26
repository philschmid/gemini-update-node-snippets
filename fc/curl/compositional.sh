#!/bin/bash

# =============================
# Function Declarations
# =============================

# Define light control schemas
turn_on_the_lights_schema='{
  "name": "turn_on_the_lights"
}'

turn_off_the_lights_schema='{
  "name": "turn_off_the_lights"
}'

# Define prompt
prompt="Hey, can you write run some python code to turn on the lights, wait 10s and then turn off the lights?"

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
# Create Request Payload
# =============================

# Create request payload with function declarations and code execution
REQUEST_PAYLOAD=$(cat << EOF
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "$prompt"
        }
      ]
    }
  ],
  "tools": [
    {
      "code_execution": {}
    },
    {
      "functionDeclarations": [
        $turn_on_the_lights_schema,
        $turn_off_the_lights_schema
      ]
    }
  ],
  "generationConfig": {
    "modality": "AUDIO"
  }
}
EOF
)

# =============================
# Send Request
# =============================

# Send request to Gemini API
echo "Sending request to Gemini API..."
RESPONSE=$(curl -s -X POST "$API_URL?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

# =============================
# Process Response
# =============================

# Extract and display the response
TEXT_RESPONSE=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.text != null) | .text')
CODE_EXECUTION=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.codeExecution != null) | .codeExecution')
FUNCTION_CALLS=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[] | select(.functionCall != null) | .functionCall')

echo -e "\nText Response:"
echo "$TEXT_RESPONSE"

if [ -n "$CODE_EXECUTION" ]; then
  echo -e "\nCode Execution:"
  echo "$CODE_EXECUTION"
fi

if [ -n "$FUNCTION_CALLS" ]; then
  echo -e "\nFunction Calls:"
  echo "$FUNCTION_CALLS" | jq -c '.' | while read -r FUNCTION_CALL; do
    NAME=$(echo "$FUNCTION_CALL" | jq -r '.name')
    echo "$NAME()"
  done
fi 