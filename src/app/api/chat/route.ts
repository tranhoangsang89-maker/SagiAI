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
