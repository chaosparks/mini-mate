import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from "../constants";

export const minifyCodeWithGemini = async (
  code: string,
  type: 'JS' | 'CSS'
): Promise<string> => {
  // Use process.env.API_KEY directly as per guidelines.
  // We assume the environment variable is configured and available.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a highly efficient code minifier for web development.
    Task: Minify the following ${type} code.
    Rules:
    1. Remove all unnecessary whitespace, newlines, and comments.
    2. Shorten variable names where safe (mangling) for JavaScript, but ensure global scope safety.
    3. Optimize CSS rules where possible (e.g., combining shorter notations).
    4. Do NOT explain your code.
    5. Do NOT wrap the output in markdown code blocks (like \`\`\`). Return ONLY the raw string of the minified code.
    6. Ensure the code remains syntactically valid and functionally identical.

    Input Code:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster simple tasks
      }
    });

    const text = response.text || "";
    // Cleanup if model accidentally included markdown block
    return text.replace(/^```(css|javascript|js)?/i, '').replace(/```$/, '').trim();
  } catch (error) {
    console.error("Gemini Minification Error:", error);
    throw new Error("Failed to minify code using Gemini AI.");
  }
};