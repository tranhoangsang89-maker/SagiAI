'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User } from 'lucide-react';
import clsx from 'clsx';

import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  isNew?: boolean;
}

import LeadForm from './LeadForm';

export default function MessageBubble({ content, role, isNew }: MessageBubbleProps) {
  const isUser = role === 'user';
  const [displayedContent, setDisplayedContent] = useState(isNew && !isUser ? '' : content);

  useEffect(() => {
    if (isNew && !isUser) {
      if (displayedContent.length < content.length) {
        const timeout = setTimeout(() => {
          setDisplayedContent(content.slice(0, displayedContent.length + 3));
        }, 10);
        return () => clearTimeout(timeout);
      }
    } else {
      setDisplayedContent(content);
    }
  }, [content, displayedContent, isNew, isUser]);
  
  const showLeadForm = !isUser && (content.includes('[LEAD_FORM]') || content.toLowerCase().includes('báo giá chi tiết') || content.toLowerCase().includes('để lại thông tin'));

  
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
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, ...props }) => {
                const isQR = props.alt?.toLowerCase().includes('qr') || props.src?.toLowerCase().includes('qr') || props.alt?.toLowerCase().includes('zalo') || props.src?.toLowerCase().includes('zalo');
                
                if (isQR) {
                  return (
                    <div className="max-w-[260px] mx-auto bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-center shadow-xl mt-3 mb-2">
                      <div className="text-xs text-orange-400 font-semibold tracking-wider mb-2">KẾT NỐI TRỰC TIẾP VỚI ANH SANG</div>
                      <div className="flex justify-center">
                        <img 
                          {...props} 
                          className="w-36 h-36 rounded-xl p-2 bg-white object-contain" 
                        />
                      </div>
                      <a 
                        href="https://zalo.me/0888003205" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full mt-3 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all no-underline"
                      >
                        💬 Nhắn Zalo 0888.003.205
                      </a>
                    </div>
                  );
                }
                
                return <img {...props} className="rounded-xl max-w-full shadow-lg" />;
              }
            }}
          >
            {displayedContent}
          </ReactMarkdown>
          
          {!isUser && !(content.match(/!\[.*?(qr|zalo).*?\]\(.*?\)/i) || content.match(/!\[.*?\]\(.*?(qr|zalo).*?\)/i)) && (content.toLowerCase().includes('liên hệ') || content.toLowerCase().includes('zalo') || content.includes('0888')) && (
            <div className="mt-4 border-t border-slate-700/50 pt-3">
              <a 
                href="https://zalo.me/0888003205" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 no-underline"
              >
                <span className="text-lg">💬</span>
                <span>Nhắn Zalo trực tiếp với anh Sang</span>
              </a>
            </div>
          )}
          
          {showLeadForm && displayedContent.length === content.length && (
            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <LeadForm />
            </div>
          )}
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
