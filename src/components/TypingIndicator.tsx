'use client';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1.5 p-4 glass-panel rounded-2xl rounded-tl-sm w-16 h-10 shadow-lg">
      <motion.div
        className="w-2 h-2 bg-blue-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-blue-400 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
}
