#!/usr/bin/env node

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { GoogleGenAI } from '@google/genai';

// Read input from stdin
async function readInput() {
  let input = '';
  process.stdin.setEncoding('utf8');
  
  return new Promise((resolve) => {
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    
    process.stdin.on('end', () => {
      resolve(input.trim());
    });
  });
}

// Extract code from Gemini's response
function extractCodeBlock(response) {
  const regex = /```(?:javascript|js)?\s*([\s\S]*?)\s*```/;
  const match = response.match(regex);
  return match ? match[1].trim() : null;
}

async function main() {
  try {
    // Check for GEMINI_API_KEY in environment
    if (!process.env.GEMINI_API_KEY) {
      console.error('Error: GEMINI_API_KEY environment variable is not set');
      console.error('Please set it before running this script:');
      console.error('  export GEMINI_API_KEY=your_api_key');
      process.exit(1);
    }

    // 1. Read the user's code snippet from stdin
    const codeSnippet = await readInput();
    if (!codeSnippet) {
      console.error('No code provided. Please pipe code to this script.');
      console.error('Usage: cat yourfile.js | node migrate.js [outputname]');
      process.exit(1);
    }
    
    // Get the output filename from arguments or default
    const args = process.argv.slice(2);
    const outputFileName = args[0] ? `new_${args[0]}` : 'new_code.js';
    
    // 2. Read the migration guide markdown
    let migrateGuide;
    let sdkCode;
    try {
      migrateGuide = await fs.readFile('migrate.md', 'utf8');
      sdkCode = await fs.readFile('sdk.md', 'utf8');
    } catch (error) {
      console.error('Error: Cannot read migration guide file (migrate.md).');
      console.error('Make sure the file exists in the current directory.');
      process.exit(1);
    }
    
    // 3. Create the prompt with the user's code
    const fullPrompt = `Here is the migration guide: ${migrateGuide}\n\nHere is the SDK code: ${sdkCode}\n\nHere is the user's code: \`\`\`javascript\n${codeSnippet}\n\`\`\``;
    
    console.log('🔄 Processing code migration with Gemini...');
    
    // 4. Call Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-pro-exp-02-05",
        contents: fullPrompt,
      });
      
      // 5. Extract the code from Gemini's response
      const migratedCode = extractCodeBlock(response.text);
      
      if (!migratedCode) {
        console.error('Failed to extract migrated code from Gemini response');
        process.exit(1);
      }
      
      // 6. Save the code to a temporary file
      const tempFileName = `temp_${randomUUID()}.js`;
      await fs.writeFile(tempFileName, migratedCode, 'utf8');
      
      console.log('🧪 Testing migrated code execution...');
      
      // 7. Execute the migrated code
      try {
        execSync(`node ${tempFileName}`, { stdio: 'inherit' });
        console.log('\n✅ Migration successful!');
        
        // 8. Save the result to a new file
        await fs.writeFile(outputFileName, migratedCode, 'utf8');
        console.log(`\n✨ Migrated code saved to: ${outputFileName}`);
        
        // 9. Print the migrated code to stdout
        console.log('\n--- Migrated Code ---\n');
        
      } catch (execError) {
        console.error('\n❌ Execution of migrated code failed:', execError.message);
      } finally {
      }
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError.message);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 