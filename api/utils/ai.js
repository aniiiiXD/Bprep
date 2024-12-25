const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(""); // if this is empty you gotta generate a separate AI key ,
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateFollowUpQuestions(question, answer, numberOfFollowUps = 5) {
  const prompt = `You are an interviewer for MBA Schools. Based on this question: "${question}" and answer: "${answer}", generate exactly ${numberOfFollowUps} follow-up questions as if you are conducting an interview. Format: Return only the questions, one per line, without any numbers or prefixes.`;

  try {
    const result = await model.generateContent(prompt); 

    console.log("Full AI Response:", JSON.stringify(result, null, 2));

    const generatedText = result.response.text(); 

    // Process the generated text to extract questions
    const questions = generatedText
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q && q.endsWith("?"))
      .map((q) => q.replace(/^[\d\-*]+\s*/, ""))
      .slice(0, numberOfFollowUps);

    if (questions.length < numberOfFollowUps) {
      console.warn(`Generated fewer than ${numberOfFollowUps} questions:`, questions);
    }

    return questions;
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    throw new Error("Failed to generate follow-up questions.");
  }
}

module.exports = {generateFollowUpQuestions}

