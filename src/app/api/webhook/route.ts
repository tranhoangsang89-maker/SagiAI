import { NextRequest } from "next/server";

const VERIFY_TOKEN = "sagi_citizen_secret_2026";

// 👉 DÁN MÃ PAGE ACCESS TOKEN ANH ĐÃ LƯU LÚC NÃY VÀO DƯỚI ĐÂY:
const PAGE_ACCESS_TOKEN = "EAAYp1iv278wBSltgXIU3KPZAZCNumMpGbhRvaZBLPBwAxDBg9RxZAi1ANZBJmqASiggVdjbmFVoLDHJazyUX4hl9JVrN7jGuhjvaZBfZCSQjslz1FFwfgbVfbZBbM2gL9uXUYBkiK55M42Ndb0hSureLcjjRlSC5xhgVsudALxPi1iIZCgiggs4t8BkmuPrJokK6ZC6HEvZCN9SGgZDZD";

// 1. Xác minh Webhook với Meta
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// 2. Nhận tin nhắn và gọi Sagi trả lời
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging?.[0];

        // Kiểm tra đúng là tin nhắn của khách (bỏ qua tin phản hồi của chính Page)
        if (webhookEvent && webhookEvent.message && !webhookEvent.message.is_echo) {
          const senderPsid = webhookEvent.sender.id;
          const userText = webhookEvent.message.text || "";

          console.log(`[Khách gửi] ID ${senderPsid}: ${userText}`);

          // Câu trả lời của Sagi (Anh có thể kết nối thêm Gemini API ở đây)
          const replyText = `Dạ Sagi chào anh Sang ạ! Em đã nhận được tin nhắn: "${userText}". Sagi - Trợ lý số của Sang Citizen đã chính thức online trên Messenger rồi nè! 🎉`;

          // Gửi tin nhắn phản hồi về lại Facebook
          await sendFacebookMessage(senderPsid, replyText);
        }
      }
      return new Response("EVENT_RECEIVED", { status: 200 });
    }

    return new Response("Not a page event", { status: 404 });
  } catch (error) {
    console.error("Lỗi webhook:", error);
    return new Response("Error", { status: 500 });
  }
}

// Hàm gửi tin nhắn qua Facebook Graph API
async function sendFacebookMessage(recipientId: string, messageText: string) {
  const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const payload = {
    recipient: { id: recipientId },
    message: { text: messageText },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  console.log("Kết quả gửi tin nhắn Facebook:", result);
}
