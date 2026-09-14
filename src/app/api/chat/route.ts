import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

import { SYSTEM_INSTRUCTION } from './prompt';

export async function POST(req: Request) {
  try {
    // Tự động load tất cả API Key (hỗ trợ nhiều key để luân phiên)
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2
    ].filter(Boolean) as string[];

    // Chọn ngẫu nhiên 1 Key cho mỗi lượt chat
    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const ai = new GoogleGenAI({ apiKey: randomKey });

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ reply: 'Lỗi: Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    let telegramPromise: Promise<void> | null = null;

    // Check for phone number in the last user message for Lead notification
    const lastUserMessage = [...messages].reverse().find((msg: { role: string; content: string }) => msg.role === 'user');
    if (lastUserMessage) {
      const phoneRegex = /(?:0|\+84)[\s.-]*[35789](?:[\s.-]*\d){8}\b/g;
      const matches = lastUserMessage.content.match(phoneRegex);
      if (matches && matches.length > 0) {
        console.log(`\n🔔 [LEAD ALERT] Có khách vừa để lại SĐT: ${matches.join(', ')} trên Sagi AI!`);
        
        // Đưa tác vụ tóm tắt và gửi Telegram vào một Promise chạy song song
        telegramPromise = (async () => {
          const fullHistoryText = messages.map((msg: { role: string; content: string }) => {
            const roleName = msg.role === 'user' ? 'Khách' : 'Sagi';
            return `${roleName}: ${msg.content}`;
          }).join('\n');

          let summary = "Không thể tạo tóm tắt.";
          try {
            const summaryResponse = await ai.models.generateContent({
              model: 'gemini-flash-lite-latest',
              contents: `Hãy đọc đoạn chat sau giữa khách hàng và chatbot Sagi, sau đó tóm tắt CỰC KỲ NGẮN GỌN (1-2 gạch đầu dòng) xem khách hàng đang có nhu cầu gì, quan tâm dịch vụ nào hoặc ngân sách bao nhiêu.\n\nĐoạn chat:\n${fullHistoryText}\n\nTóm tắt ngắn gọn:`
            });
            summary = summaryResponse.text || summary;
          } catch (err) {
            console.error("Lỗi khi tóm tắt lịch sử chat:", err);
          }

          // Bắn thông báo về Telegram
          if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            try {
              await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: process.env.TELEGRAM_CHAT_ID,
                  text: `🔥 [Sagi AI] CÓ KHÁCH HÀNG ĐỂ LẠI SỐ ĐIỆN THOẠI 🔥\n\n📞 Số Zalo/Phone: ${matches.join(', ')}\n\n💡 TÓM TẮT NHU CẦU:\n${summary}\n\n🚀 Anh Sang vào liên hệ chốt khách ngay nhé!`
                })
              });
              console.log('✅ Đã gửi thông báo Lead qua Telegram thành công!');
            } catch (err) {
              console.error('❌ Lỗi gửi thông báo Telegram:', err);
            }
          }
        })();
      }
    }

    // Format messages for Gemini API
    const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Bắt đầu gọi Gemini API trả lời khách chạy song song
    const mainResponsePromise = ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: geminiMessages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    // Chờ cả 2 tác vụ (nếu có) hoàn thành cùng lúc để tiết kiệm 50% thời gian chờ
    const [response] = await Promise.all([
      mainResponsePromise,
      telegramPromise || Promise.resolve()
    ]);

    return NextResponse.json({ reply: response.text });
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ reply: 'Lỗi hệ thống Sagi AI: ' + (error as Error).message }, { status: 500 });
  }
}
