import { NextResponse } from "next/server";
import { messageToGpt } from "@/lib/openAI/message-to-gpt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const textContent = body?.textContent;

    if (!textContent) {
      return NextResponse.json(
        { error: "Missing textContent" },
        { status: 400 }
      );
    }

    const reply = await messageToGpt(textContent);
    return NextResponse.json({ reply });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" ? err.message : "Failed to send";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

