import { NextRequest } from "next/server";

const VERIFY_TOKEN = "sagi_citizen_secret_2026";

// 👉 DÁN MÃ PAGE ACCESS TOKEN ANH ĐÃ LƯU VÀO ĐÂY:
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

// 2. Nhận tin nhắn Messenger và chuyển thẳng qua Não bộ Sagi AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging?.[0];

        // Kiểm tra đúng là tin nhắn của khách
        if (webhookEvent && webhookEvent.message && !webhookEvent.message.is_echo) {
          const senderPsid = webhookEvent.sender.id;
          const userText = webhookEvent.message.text || "";

          console.log(`[Messenger nhận từ ${senderPsid}]: ${userText}`);

          // Gọi trực tiếp vào Não bộ Sagi AI trên web app
          const sagiReply = await askSagiBrain(userText);

          // Gửi câu trả lời của Sagi về lại Facebook Messenger
          await sendFacebookMessage(senderPsid, sagiReply);
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

// Hàm kết nối thẳng vào Não bộ Sagi AI hiện có trên web app
async function askSagiBrain(prompt: string): Promise<string> {
  try {
    const res = await fetch("https://sagi-ai.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }]
      }),
    });

    const data = await res.json();
    return data.reply || "Dạ Sagi chào anh/chị ạ! Em có thể hỗ trợ gì cho anh/chị về giải pháp công nghệ ạ?";
  } catch (error) {
    console.error("Lỗi kết nối não bộ Sagi:", error);
    return "Dạ Sagi chào anh/chị! Hiện tại hệ thống đang bận một chút, anh/chị nhắn lại câu hỏi giúp em nhé!";
  }
}

// Hàm gửi tin nhắn qua Facebook Graph API
async function sendFacebookMessage(recipientId: string, messageText: string) {
  const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const payload = {
    recipient: { id: recipientId },
    message: { text: messageText },
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
