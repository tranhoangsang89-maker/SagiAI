'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function LeadForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    } catch (error) {
      alert('Lỗi kết nối, vui lòng kiểm tra mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center animate-pulse">
        <p className="text-emerald-400 font-medium text-sm">Cảm ơn {name}! Yêu cầu đã được gửi.</p>
        <p className="text-slate-400 text-xs mt-1">Chuyên gia của chúng tôi sẽ liên hệ sớm nhất.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 shadow-inner">
      <h4 className="text-sm font-semibold text-blue-300 mb-3">Nhận Báo Giá Chi Tiết</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Tên của bạn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
        </div>
        <div>
          <input
            type="tel"
            placeholder="Số điện thoại / Zalo"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <span>{isLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}</span>
          {!isLoading && <Send size={14} />}
        </button>
      </form>
    </div>
  );
}
