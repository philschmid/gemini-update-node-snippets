import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  FileState,
  GoogleAICacheManager,
  GoogleAIFileManager,
} from '@google/generative-ai/server';

// A helper function that uploads the video to be cached.
async function uploadMp4Video(filePath, displayName) {
  const fileManager = new GoogleAIFileManager(process.env.API_KEY);
  const fileResult = await fileManager.uploadFile(filePath, {
    displayName,
    mimeType: 'video/mp4',
  });

  const { name, uri } = fileResult.file;

  // Poll getFile() on a set interval (2 seconds here) to check file state.
  let file = await fileManager.getFile(name);
  while (file.state === FileState.PROCESSING) {
    console.log('Waiting for video to be processed.');
    // Sleep for 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    file = await fileManager.getFile(name);
  }

  console.log(`Video processing complete: ${uri}`);

  return fileResult;
}

// Download video file
// curl -O https://storage.googleapis.com/generativeai-downloads/data/Sherlock_Jr_FullMovie.mp4
const pathToVideoFile = 'Sherlock_Jr_FullMovie.mp4';

// Upload the video.
const fileResult = await uploadMp4Video(pathToVideoFile, 'Sherlock Jr. video');

// Construct a GoogleAICacheManager using your API key.
const cacheManager = new GoogleAICacheManager(process.env.API_KEY);

// Create a cache with a 5 minute TTL.
const displayName = 'sherlock jr movie';
const model = 'models/gemini-1.5-flash-001';
const systemInstruction =
  'You are an expert video analyzer, and your job is to answer ' +
  "the user's query based on the video file you have access to.";
let ttlSeconds = 300;
const cache = await cacheManager.create({
  model,
  displayName,
  systemInstruction,
  contents: [
    {
      role: 'user',
      parts: [
        {
          fileData: {
            mimeType: fileResult.file.mimeType,
            fileUri: fileResult.file.uri,
          },
        },
      ],
    },
  ],
  ttlSeconds,
});

// Get your API key from https://aistudio.google.com/app/apikey
// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Construct a `GenerativeModel` which uses the cache object.
const genModel = genAI.getGenerativeModelFromCachedContent(cache);

// Query the model.
const result = await genModel.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          text:
            'Introduce different characters in the movie by describing ' +
            'their personality, looks, and names. Also list the ' +
            'timestamps they were introduced for the first time.',
        },
      ],
    },
  ],
});

console.log(result.response.usageMetadata);

// The output should look something like this:
//
// {
//   promptTokenCount: 696220,
//   candidatesTokenCount: 270,
//   totalTokenCount: 696490,
//   cachedContentTokenCount: 696191
// }

console.log(result.response.text());