# Gemini Code Migrator

A tool to automatically migrate code from the old Gemini JavaScript SDK (`@google/generative-ai`) to the new SDK (`@google/genai`) using Gemini itself.

## Prerequisites

- Node.js (v18 or newer)
- A Google AI Gemini API key

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd gemini-code-migrator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Gemini API key:
   ```bash
   export GEMINI_API_KEY=YOUR_API_KEY
   ```

## Usage

The script takes JavaScript code via stdin and outputs the migrated code to stdout and a new file.

```bash
# Basic usage
cat examples/basic_example.js | node migrate.js basic_example.js
```

## How It Works

1. The script takes your old Gemini SDK code as input
2. It sends this code to Gemini 2.0 Flash along with migration instructions
3. Gemini generates the updated code using the new SDK
4. The script tests the migrated code for execution errors
5. If successful, it saves the code to a new file and prints it to stdout

## Example

Input:
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "How does AI work?";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}
main();
```

Output:
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "How does AI work?",
  });
  console.log(response.text);
}

await main();
```