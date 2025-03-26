// =============================
// Function Declaration
// =============================
import { Type } from '@google/genai';

// Define a function that the model can call to control smart lights
const setLightValuesFunctionDeclaration = {
  name: 'set_light_values',
  description: 'Sets the brightness and color temperature of a light.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      brightness: {
        type: Type.NUMBER,
        description: 'Light level from 0 to 100. Zero is off and 100 is full brightness',
      },
      color_temp: {
        type: Type.STRING,
        enum: ['daylight', 'cool', 'warm'],
        description: 'Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.',
      },
    },
    required: ['brightness', 'color_temp'],
  },
};

/**
 * Set the brightness and color temperature of a room light. (mock API)
 * @param {number} brightness - Light level from 0 to 100. Zero is off and 100 is full brightness
 * @param {string} color_temp - Color temperature of the light fixture, which can be `daylight`, `cool` or `warm`.
 * @returns {Object} A dictionary containing the set brightness and color temperature.
 */
function setLightValues(brightness, color_temp) {
  return {
    brightness: brightness,
    colorTemperature: color_temp
  };
}

// =============================
// Model Configuration
// =============================
// Configure Gemini with our function declaration
import { GoogleGenAI } from '@google/genai';

// Generation Config with Function Declaration
const config = {
  tools: [{
    functionDeclarations: [setLightValuesFunctionDeclaration]
  }]
};

// Configure the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// User Prompt
const contents = [
  {
    role: 'user',
    parts: [{ text: 'Turn the lights down to a romantic level' }]
  }
];

// Send request
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: contents,
  config: config
});

console.log(response.functionCalls[0]); 

// =============================
// Function Execution
// =============================

// Extract tool call details
const tool_call = response.functionCalls[0]

let result;
if (tool_call.name === 'set_light_values') {
  result = setLightValues(tool_call.args.brightness, tool_call.args.color_temp);
  console.log(`Function execution result: ${JSON.stringify(result)}`);
}

// =============================
// Create Response
// =============================

// Create a function response part
const function_response_part = {
  name: tool_call.name,
  response: { result }
}

// Append the model's function call
contents.push({ role: 'model', parts: [{ functionCall: tool_call }] });

// Append the function response
contents.push({ role: 'user', parts: [{ functionResponse: function_response_part }] });

// Get the final response from the model
const final_response = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: contents,
  config: config
});

console.log(final_response.text);
