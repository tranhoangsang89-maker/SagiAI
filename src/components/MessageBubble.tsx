'use client';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User } from 'lucide-react';
import clsx from 'clsx';

import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
}

export default function MessageBubble({ content, role }: MessageBubbleProps) {
  const isUser = role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx('flex w-full space-x-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 mt-1 overflow-hidden border border-white/10">
          <img src="/avatar.jpeg" alt="Sagi Avatar" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div
        className={clsx(
          'px-5 py-3.5 max-w-[85%] md:max-w-[75%] rounded-2xl shadow-lg text-[15px] leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-600/20'
            : 'glass-panel text-slate-100 rounded-tl-sm'
        )}
      >
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700 prose-pre:backdrop-blur-md prose-code:text-blue-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-700/80 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/10 mt-1">
          <User size={16} className="text-white" />
        </div>
      )}
    </motion.div>
  );
}
