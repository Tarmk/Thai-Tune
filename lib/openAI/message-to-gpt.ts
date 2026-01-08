"use server";
import OpenAI from "openai";

export async function messageToGpt(textContent: any) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-2025-04-14",
    messages: [
      {
        role: "system",
        content:
          "You are a music assistant analyzing sheet music. Please provide detailed analysis and help answer questions about the score. Do not use any special formatting characters like asterisks (*), hashtags (#), or other Markdown syntax in your responses. Provide your analysis in plain text only. Summarize the response in 1-2 paragraphs.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: textContent,
          },
        ],
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
