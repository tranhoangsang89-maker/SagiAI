'use client';
import { useState, useRef, useEffect } from 'react';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import { Sparkles, Settings, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Dạ chào anh/chị! Em là Sagi – trợ lý số đại diện thương hiệu Sang Citizen do anh Trần Hoàng Sang phát triển.\n\nEm có thể hỗ trợ anh/chị tìm hiểu về các giải pháp Web App tự động hóa, Chatbot AI chăm sóc khách hàng 24/7 và dịch vụ sản xuất Mascot/Video Ads bằng AI. Anh/chị đang quan tâm giải pháp nào cho doanh nghiệp của mình ạ?' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Lỗi mạng: Không thể kết nối với Sagi AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-[100dvh] w-full flex-col items-center justify-center p-0 md:p-6 lg:p-10 relative overflow-hidden">
      
      <div className="w-full max-w-5xl h-full flex flex-col md:glass-panel md:rounded-3xl overflow-hidden shadow-2xl relative z-10 bg-slate-900/80 md:bg-transparent">
        
        {/* Header */}
        <header className="w-full h-18 border-b border-white/10 flex items-center justify-between px-4 md:px-6 py-4 flex-shrink-0 z-20 bg-slate-900/60 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden border border-white/10">
              <img src="/avatar.jpeg" alt="Sagi Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-tight tracking-wide">Sagi - Đại sứ số AI</h1>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">Online - Lean System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <button className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <Settings size={20} />
            </button>
            <button className="p-2 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide relative z-0">
          <div className="flex flex-col space-y-6 min-h-full justify-end pb-2">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role as 'user'|'assistant'} content={msg.content} />
              ))}
              
              {messages.length === 1 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col gap-2.5 mt-2 max-w-[90%] md:max-w-[75%]"
                >
                  {[
                    "Sang Citizen có những giải pháp tự động hóa & Web App nào?",
                    "Chi phí và quy trình làm một Chatbot AI 24/7 như thế nào?",
                    "Tôi muốn xem qua các Case Study thực tế."
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(suggestion)}
                      className="text-left px-4 py-3 text-sm text-blue-200 bg-blue-900/20 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-400 hover:text-white rounded-xl transition-all shadow-lg backdrop-blur-sm self-start leading-relaxed"
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full justify-start mt-4"
              >
                <TypingIndicator />
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 pt-2 border-t border-white/10 bg-slate-900/60 backdrop-blur-xl z-20 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
            <p className="text-center text-[11px] text-slate-500 mt-3 font-medium flex items-center justify-center space-x-1">
              <Sparkles size={12} />
              <span>Sagi AI có thể mắc lỗi. Hãy kiểm tra các thông tin báo giá và hệ thống.</span>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
