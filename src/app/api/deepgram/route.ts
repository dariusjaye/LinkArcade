import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    // Check if API key exists and isn't just a placeholder
    if (!apiKey || apiKey === "demo-deepgram-api-key") {
      console.warn("Deepgram API key is missing or using placeholder value");
      return NextResponse.json({
        key: "",
        error: "API key not configured"
      }, { status: 200 });
    }
    
    return NextResponse.json({
      key: apiKey,
    });
  } catch (error) {
    console.error("Error retrieving Deepgram API key:", error);
    return NextResponse.json({
      key: "",
      error: "Failed to retrieve API key"
    }, { status: 500 });
  }
}
