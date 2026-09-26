import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "sagi_citizen_secret_2026";

// 1. Meta gửi GET request để xác minh Webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED_SUCCESS");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// 2. Meta gửi POST request khi có khách nhắn tin Messenger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Tin nhắn từ Facebook:", JSON.stringify(body, null, 2));

    // Trả lời 200 ngay lập tức để Meta ghi nhận
    return new Response("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
