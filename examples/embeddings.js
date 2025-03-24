const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-exp-03-07"});

async function run() {
    const result = await model.embedContent("What is the meaning of life?");
    console.log(result.embedding.values);
}

run();