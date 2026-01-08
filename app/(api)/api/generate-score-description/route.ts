import { NextResponse } from "next/server";
import { generateScoreDescription } from "@/lib/openAI/score-description";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const extractedData = body?.extractedData;

    if (!extractedData) {
      return NextResponse.json(
        { error: "Missing extractedData" },
        { status: 400 }
      );
    }

    const description = await generateScoreDescription(extractedData);
    return NextResponse.json({ description });
  } catch (err: any) {
    const message =
      typeof err?.message === "string" ? err.message : "Failed to generate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

