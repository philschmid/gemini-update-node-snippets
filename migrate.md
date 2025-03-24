# Migration Guide: Updating from `@google/generative-ai` to `@google/genai`

This guide will help you migrate your existing applications from the old JavaScript SDK (`@google/generative-ai`) to the new and improved SDK (`@google/genai`).


## Key Differences

| Feature | Old SDK (`@google/generative-ai`) | New SDK (`@google/genai`) |
|---------|-----------------------------------|---------------------------|
| Main import | `GoogleGenerativeAI` | `GoogleGenAI` |
| Initialization | `new GoogleGenerativeAI(apiKey)` | `new GoogleGenAI({ apiKey })` |
| Model access | `genAI.getGenerativeModel({ model })` | Direct through `ai.models.generateContent()` |
| Content generation | `model.generateContent()` | `ai.models.generateContent()` |
| Chat functionality | `model.startChat()` | `ai.chats.create()` |
| File handling | Base64 inline data | File upload API with URIs |
| Response text | `result.response.text()` | `response.text` |

## Migration Examples

### Example 1: Basic Content Generation

#### Old SDK
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = "How does AI work?";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}
main();
```

#### New SDK
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "How does AI work?",
  });
  console.log(response.text);
}

await main();
```

### Example 2: Working with Images

#### Old SDK
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'node:fs';

const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

const prompt = "Describe how this product might be manufactured.";
const imagePart = fileToGenerativePart("/path/to/image.png", "image/png");

const result = await model.generateContent([prompt, imagePart]);
console.log(result.response.text());
```

#### New SDK
```javascript
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

async function main() {
  const image = await ai.files.upload({
    file: "/path/to/organ.png",
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      createUserContent([
        "Tell me about this instrument",
        createPartFromUri(image.uri, image.mimeType),
      ]),
    ],
  });
  console.log(response.text);
}

await main();
```

### Example 3: Chat Functionality

#### Old SDK
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

let result = await chat.sendMessage("I have 2 dogs in my house.");
console.log(result.response.text());
let result2 = await chat.sendMessage("How many paws are in my house?");
console.log(result2.response.text());
```

#### New SDK
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

async function main() {
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const response1 = await chat.sendMessage({
    message: "I have 2 dogs in my house.",
  });
  console.log("Chat response 1:", response1.text);

  const response2 = await chat.sendMessage({
    message: "How many paws are in my house?",
  });
  console.log("Chat response 2:", response2.text);
}

await main();
```

## Key Migration Points

1. **Package Import**: Change from `@google/generative-ai` to `@google/genai` and update the main class import from `GoogleGenerativeAI` to `GoogleGenAI`.

2. **API Key Configuration**: The new SDK accepts an object with configuration options:
   ```javascript
   // Old
   const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
   
   // New
   const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });
   ```

3. **Content Generation**:
   ```javascript
   // Old
   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
   const result = await model.generateContent("prompt");
   console.log(result.response.text());
   
   // New
   const response = await ai.models.generateContent({
     model: "gemini-2.0-flash",
     contents: "prompt",
   });
   console.log(response.text);
   ```

4. **File Handling**: The new SDK simplifies file handling with a dedicated upload function:
   ```javascript
   // Old (manual base64 conversion)
   function fileToGenerativePart(path, mimeType) {
     return {
       inlineData: {
         data: Buffer.from(fs.readFileSync(path)).toString("base64"),
         mimeType,
       },
     };
   }
   
   // New (using files API)
   const image = await ai.files.upload({
     file: "/path/to/image.png",
   });
   ```

5. **Chat Interface**: Updated method names and parameter structure:
   ```javascript
   // Old
   const chat = model.startChat({ history });
   const result = await chat.sendMessage("message");
   
   // New
   const chat = ai.chats.create({ model: "model-name", history });
   const response = await chat.sendMessage({ message: "message" });
   ```

6. **Helper Functions**: The new SDK provides additional utility functions:
   ```javascript
   import { createUserContent, createPartFromUri } from "@google/genai";
   ```

## Additional Resources

- [New SDK GitHub Repository](https://github.com/googleapis/js-genai)
- [Old SDK GitHub Repository](https://github.com/google-gemini/generative-ai-js)

## Compatibility Notes

The new SDK represents a significant improvement in API design and capabilities. While migration requires some code changes, the updated interface provides a more consistent and intuitive experience. The new SDK also follows Google Cloud client library conventions, making it more consistent with other Google Cloud services. 

# Additional Instructions: 

- Make sure to always use `process.env.GEMINI_API_KEY` as process env for the clients. 
- Update `gemini-1.5-flash` to `gemini-2.0-flash`, keep all other model ids as they are in the original docs
- if a function is already used update it to be called `main`
- return should be javascript not typescript even if the sdk code supports typescript.

Update the following snippet only return the new snippet, no info nothing, only the code.