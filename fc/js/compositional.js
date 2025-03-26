// Light control schemas
const turnOnTheLightsSchema = { name: 'turn_on_the_lights' };
const turnOffTheLightsSchema = { name: 'turn_off_the_lights' };

// Example 1: Lights on and off with delay
const prompt1 = `
  Hey, can you write run some python code to turn on the lights, wait 10s and then turn off the lights?
`;

const tools1 = [
  { codeExecution: {} },
  { functionDeclarations: [turnOnTheLightsSchema, turnOffTheLightsSchema] }
];

// Example 2: Multiple tasks example
const prompt2 = `
  Hey, I need you to do three things for me.

    1.  Turn on the lights.
    2.  Then compute the largest prime palindrome under 100000.
    3.  Then use Google Search to look up information about the largest earthquake in California the week of Dec 5 2024.

  Thanks!
`;

const tools2 = [
  { googleSearch: {} },
  { codeExecution: {} },
  { functionDeclarations: [turnOnTheLightsSchema, turnOffTheLightsSchema] }
];

// Example 1 execution
await run(prompt1, {tools: tools1, modality: "AUDIO"});

// Example 2 execution
await run(prompt2, {tools: tools2, modality: "AUDIO"});