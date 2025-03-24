import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = "How does AI work?";

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
}
main(); 