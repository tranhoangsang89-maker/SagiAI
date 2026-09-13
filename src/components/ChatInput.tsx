'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-2 flex items-end relative overflow-hidden transition-all focus-within:ring-1 focus-within:ring-blue-500/50 shadow-xl">
      <button className="p-3 text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0">
        <Paperclip size={20} />
      </button>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập câu hỏi cho Sagi AI..."
        className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 resize-none outline-none py-3 px-2 scrollbar-hide text-[15px]"
        rows={1}
        disabled={isLoading}
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className="p-3 rounded-xl bg-blue-600 text-white flex-shrink-0 disabled:opacity-50 disabled:bg-slate-700 transition-colors mb-0.5 mr-0.5 shadow-lg shadow-blue-600/30"
      >
        <Send size={18} />
      </motion.button>
    </div>
  );
}
