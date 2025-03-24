import { GoogleGenerativeAI } from "@google/generative-ai";

async function runChat() {
  const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello, I'm learning about AI" }],
      },
      {
        role: "model",
        parts: [{ text: "That's great! What would you like to know about AI?" }],
      },
    ],
  });

  const result1 = await chat.sendMessage("What are the different types of machine learning?");
  console.log("Response 1:", result1.response.text());
  
  const result2 = await chat.sendMessage("Can you explain supervised learning in more detail?");
  console.log("Response 2:", result2.response.text());
}

runChat(); 