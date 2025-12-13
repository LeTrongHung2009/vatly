import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 bg-[#F7F2EE] flex flex-col items-center justify-center">
      {/* Hiệu ứng Nguyên tử xoay */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Vòng ngoài */}
        <div className="absolute w-full h-full border-2 border-[#6E97D1]/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute w-full h-full border-2 border-transparent border-t-[#6E97D1] rounded-full animate-[spin_2s_linear_infinite]"></div>
        
        {/* Hạt nhân */}
        <div className="w-4 h-4 bg-[#0D205C] rounded-full shadow-[0_0_15px_rgba(110,151,209,0.8)] animate-pulse"></div>
        
        {/* Electron */}
        <div className="absolute w-16 h-16 border border-[#0D205C]/20 rounded-full rotate-45"></div>
      </div>
      
      <h1 className="mt-6 text-2xl font-bold tracking-wider text-[#0D205C]">
        Physic<span className="text-[#6E97D1]">OS</span>
      </h1>
      <p className="mt-2 text-sm text-[#6E97D1] font-medium animate-pulse">
        Đang khởi tạo phòng lab...
      </p>
    </div>
  );
};

export default LoadingScreen;