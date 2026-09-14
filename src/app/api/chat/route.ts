import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

import { SYSTEM_INSTRUCTION } from './prompt';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ reply: 'Lỗi: Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    // Check for phone number in the last user message for Lead notification
    const lastUserMessage = [...messages].reverse().find((msg: any) => msg.role === 'user');
    if (lastUserMessage) {
      const phoneRegex = /(?:0|\+84)[\s.-]*[35789](?:[\s.-]*\d){8}\b/g;
      const matches = lastUserMessage.content.match(phoneRegex);
      if (matches && matches.length > 0) {
        console.log(`\n🔔 [LEAD ALERT] Có khách vừa để lại SĐT: ${matches.join(', ')} trên Sagi AI!`);
        
        // Yêu cầu Gemini tóm tắt nhu cầu của khách dựa trên lịch sử chat
        const fullHistoryText = messages.map((msg: any) => {
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

        // Bắn thông báo về Telegram nếu có cấu hình Token
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
      }
    }

    // Format messages for Gemini API
    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: geminiMessages,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ reply: 'Lỗi hệ thống Sagi AI: ' + error.message }, { status: 500 });
  }
}
