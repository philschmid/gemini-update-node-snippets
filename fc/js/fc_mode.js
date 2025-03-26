import { FunctionCallingConfigMode } from '@google/genai';

// Configure the client with your API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the function declaration for the model
const weatherFunctionDeclaration = {
  name: 'get_current_temperature',
  description: 'Gets the current temperature for a given location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The city name, e.g. San Francisco',
      },
    },
    required: ['location'],
  },
};

// Create tools with the function declaration
const tools = [{
  functionDeclarations: [weatherFunctionDeclaration]
}];

// Configure function calling mode
const toolConfig = {
  functionCallingConfig: {
    mode: FunctionCallingConfigMode.ANY,
    allowedFunctionNames: ['get_current_temperature']
  }
};

// Create the generation config
const config = {
  temperature: 0,
  tools: tools,
  toolConfig: toolConfig,
};

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: "What's the temperature in London?",
    config: config
  });

  // Check for function calls in the response
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0]; // Assuming one function call
    console.log(`Function to call: ${functionCall.name}`);
    console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
    // In a real app, you would call your actual function here:
    // const result = await getCurrentTemperature(functionCall.args.location);
  } else {
    console.log("No function call found in the response.");
    console.log(response.text());
  }
}

await main();