import { NextResponse } from "next/server";
import { processEmailReplies } from "@/lib/email-reader";

export async function POST() {
  try {
    console.log("Checking for new email replies...");

    const results = await processEmailReplies();

    return NextResponse.json({
      success: true,
      message: `Processed ${Array.isArray(results) ? results.length : 0} emails`,
    });
  } catch (error) {
    console.error("Error checking emails:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check emails",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to check for new emails",
  });
}
