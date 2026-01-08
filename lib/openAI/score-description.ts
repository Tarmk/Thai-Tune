"use server";
import OpenAI from "openai";

export async function generateScoreDescription(extractedData: any) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-2025-04-14",
    messages: [
      {
        role: "system",
        content:
          "You are a music assistant analyzing sheet music. Please provide detailed analysis of the score. Don't mention about the source of the score (e.g music xml), just analyze the score. Output as text (Don't use markdown formatting). Only provide description that is part of the score.",
      },
      {
        role: "user",
        content: `User question: Please generate a description for this music score.\nScore Data: ${JSON.stringify(extractedData)}`,
      },
    ],
    response_format: {
      type: "text",
    },
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return response.choices[0].message.content?.trim() || "";
}
