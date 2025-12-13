import React from 'react';
import { Atom, Search, Bell, User } from 'lucide-react'; // Dùng icon từ thư viện đã cài

const DesktopHeader = () => {
  return (
    <header className="hidden lg:flex fixed top-0 w-full bg-[#F7F2EE]/90 backdrop-blur-md border-b border-[#0D205C]/10 z-40 h-20 items-center">
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-[#0D205C] rounded-xl flex items-center justify-center text-white">
            <Atom className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0D205C]">PhysicOS</span>
        </div>

        {/* Search Bar */}
        <div className="relative group w-96">
          <input 
            type="text" 
            placeholder="Tìm bài học, định luật..." 
            className="w-full bg-white border border-[#6E97D1]/30 rounded-full py-2.5 pl-12 pr-4 text-sm text-[#0D205C] focus:outline-none focus:border-[#6E97D1] shadow-sm"
          />
          <Search className="absolute left-4 top-2.5 w-5 h-5 text-[#6E97D1]" />
        </div>

        {/* Menu Items */}
        <nav className="flex items-center gap-8">
          <a href="#" className="text-[#0D205C] font-bold text-sm border-b-2 border-[#6E97D1] pb-1">Trang chủ</a>
          <a href="#" className="text-[#0D205C]/70 font-medium text-sm hover:text-[#6E97D1] transition-colors">Học tập</a>
          <a href="#" className="text-[#0D205C]/70 font-medium text-sm hover:text-[#6E97D1] transition-colors">Phòng Lab</a>
        </nav>

        {/* User Info */}
        <div className="flex items-center gap-4 pl-4 border-l border-[#0D205C]/10">
          <button className="p-2 hover:bg-[#6E97D1]/10 rounded-full">
            <Bell className="w-5 h-5 text-[#0D205C]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#0D205C] flex items-center justify-center text-white">
             <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;