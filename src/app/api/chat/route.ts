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
      const phoneRegex = /(?:0|\+84)[35789]\d{8}\b/g;
      const matches = lastUserMessage.content.match(phoneRegex);
      if (matches && matches.length > 0) {
        console.log(`\n🔔 [LEAD ALERT] Có khách vừa để lại SĐT: ${matches.join(', ')} trên Sagi AI!`);
        // TODO: Cấu hình webhook gửi tin nhắn về Telegram hoặc lưu vào Google Sheets tại đây
        // Ví dụ Telegram:
        // await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     chat_id: process.env.TELEGRAM_CHAT_ID,
        //     text: `🔔 Khách hàng trên Sagi AI vừa để lại SĐT: ${matches.join(', ')}`
        //   })
        // });
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
