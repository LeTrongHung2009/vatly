import React from 'react';
import { Atom, Layout } from 'lucide-react';

// Nhận các hàm điều hướng qua props
const PublicNavbar = ({ onNavigateHome, onNavigateStudy, onNavigateLab }) => {
  return (
    <nav className="fixed top-0 w-full z-40 bg-[#F7F2EE]/90 backdrop-blur border-b border-[#0D205C]/5 h-16 flex items-center transition-all">
      <div className="max-w-6xl mx-auto w-full px-6 flex justify-between items-center">
        
        {/* Brand - Click vào logo cũng về trang chủ */}
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#0D205C] hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-[#0D205C] rounded-lg flex items-center justify-center text-white">
            <Atom size={20} />
          </div>
          Physic<span className="text-[#6E97D1]">OS</span>
        </button>

        {/* Links - Dùng button để chuyển trang không reload */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#0D205C]">
          <button 
            onClick={onNavigateHome} 
            className="hover:text-[#6E97D1] transition-colors font-bold"
          >
            Giới thiệu
          </button>
          
          <button 
            onClick={onNavigateStudy} 
            className="hover:text-[#6E97D1] transition-colors"
          >
            Vào học
          </button>
          
          <button 
            onClick={onNavigateLab} 
            className="hover:text-[#6E97D1] transition-colors"
          >
            Lab ảo
          </button>
        </div>

        {/* Icon phụ (Hoặc nút login/menu sau này) */}
        <div className="w-8 h-8 rounded-full bg-[#0D205C]/10 flex items-center justify-center text-[#0D205C] cursor-pointer hover:bg-[#0D205C]/20 transition-colors">
          <Layout size={16} />
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;