import React from 'react';
import { Home, BookOpen, Sparkles, FlaskConical, User } from 'lucide-react';

const MobileTabBar = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex justify-between items-end px-4 h-[70px] pb-3 relative max-w-md mx-auto">
        
        {/* Home */}
        <button className="flex-1 flex flex-col items-center gap-1 text-[#0D205C]">
          <Home className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[10px] font-bold">Trang chủ</span>
        </button>

        {/* Học tập */}
        <button className="flex-1 flex flex-col items-center gap-1 text-gray-400 hover:text-[#0D205C]">
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-medium">Vào học</span>
        </button>

        {/* --- NÚT AI NỔI (Floating) --- */}
        <div className="relative w-16 flex justify-center z-50">
          <button className="absolute -top-10 w-14 h-14 rounded-full bg-gradient-to-tr from-[#0D205C] to-[#6E97D1] shadow-lg shadow-blue-900/40 flex items-center justify-center text-white ring-4 ring-white transform transition active:scale-95">
            <Sparkles className="w-7 h-7" />
          </button>
          <span className="absolute top-5 text-[10px] font-bold text-[#0D205C]">AI Tutor</span>
        </div>

        {/* Lab */}
        <button className="flex-1 flex flex-col items-center gap-1 text-gray-400 hover:text-[#0D205C]">
          <FlaskConical className="w-6 h-6" />
          <span className="text-[10px] font-medium">Lab ảo</span>
        </button>

        {/* Profile */}
        <button className="flex-1 flex flex-col items-center gap-1 text-gray-400 hover:text-[#0D205C]">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Tôi</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileTabBar;