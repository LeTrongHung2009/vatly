import React, { useState } from 'react';
import { FlaskConical, ChevronLeft, Menu, Lock, Atom, ArrowRight } from 'lucide-react';

// Import 3 component con
import UniversalPhysicsSandbox from '../components/simulations/PhysicsSandboxV16'; // Component mới v3.0

import { labs } from '../src/data/labs';

const LabPage = ({ onBackToHome }) => {
  const [activeLab, setActiveLab] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // --- LOGIC MỚI: KIỂM TRA FULL SCREEN ---
  // Nếu đang mở Sandbox, ta render nó trực tiếp đè lên mọi thứ (để đạt Full Screen 100%)
  if (activeLab?.id === 'sandbox') {
    return (
      <div className="relative w-screen h-screen bg-white">
        {/* Nút thoát Sandbox nhỏ ở góc */}
        <button 
          onClick={() => setActiveLab(null)}
          className="fixed top-4 right-4 z-[100] bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-lg text-xs font-bold"
        >
          Thoát thí nghiệm
        </button>
        
        {/* Hiển thị Component Sandbox v3.0 */}
        <UniversalPhysicsSandbox />
      </div>
    );
  }

  // --- GIAO DIỆN BÌNH THƯỜNG (CHO CÁC BÀI KHÁC) ---
  return (
    <div className="h-screen flex flex-col bg-[#F7F2EE] overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-[#0D205C] text-white p-4 shadow-md flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBackToHome} className="p-2 hover:bg-white/10 rounded-full flex items-center gap-2 text-sm">
            <ChevronLeft size={20} /> Quay lại
          </button>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <span className="font-bold flex items-center gap-2">
            <FlaskConical size={18} className="text-[#6E97D1]"/> Phòng Lab Ảo
          </span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden p-2"><Menu size={20} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`absolute md:relative z-10 h-full bg-white border-r border-[#0D205C]/10 w-72 transition-all duration-300 shadow-xl md:shadow-none flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-80'}`}>
          <div className="p-4 bg-[#F7F2EE]/50 border-b flex justify-between"><h3 className="font-bold text-[#0D205C] text-sm uppercase">Danh sách bài</h3><span className="text-xs bg-white border px-2 rounded">{labs.length}</span></div>
          <div className="overflow-y-auto h-full p-2 space-y-1 pb-20">
            {labs.map((lab) => (
              <button key={lab.id} onClick={() => setActiveLab(lab)} className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-all ${activeLab?.id === lab.id ? 'bg-[#0D205C] text-white' : 'text-gray-600 hover:bg-blue-50'}`}>
                <div className="mt-1"><Atom size={14} /></div>
                <div><span className="font-bold line-clamp-1">{lab.title}</span><span className="text-[10px] uppercase opacity-70">{lab.category}</span></div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 bg-gray-50 relative w-full h-full overflow-hidden flex flex-col">
            {activeLab ? (
                <div className="w-full h-full flex flex-col">
                    <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-[#0D205C]">{activeLab.title}</h2>
                        <span className="px-3 py-1 bg-[#E6F4F1] text-[#0D655C] text-xs font-bold rounded-full">WebGL Sim</span>
                    </div>
                    <div className="flex-1 bg-[#F0F4F8] p-4 overflow-auto flex items-center justify-center relative">
                        {/* Các bài cũ vẫn hiển thị bình thường trong khung nhỏ */}
                        {activeLab.id === 'pendulum' ? <div className="w-full h-full bg-white rounded-2xl border overflow-hidden"><PendulumSim /></div> : 
                         activeLab.id === 'interference' ? <div className="w-full h-full bg-white rounded-2xl border overflow-hidden"><WaveInterferenceLab /></div> : 
                         <div className="text-center text-gray-400">Đang tải...</div>}
                    </div>
                </div>
            ) : (
                // Dashboard khi chưa chọn bài
                <div className="w-full h-full overflow-y-auto p-8"><div className="max-w-4xl mx-auto"><h2 className="text-3xl font-bold text-[#0D205C] mb-8">Thư viện Thí nghiệm</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{labs.map((lab) => (
                    <div key={lab.id} onClick={() => setActiveLab(lab)} className="group bg-white rounded-2xl p-6 border border-[#0D205C]/5 hover:shadow-xl cursor-pointer">
                        <h3 className="text-lg font-bold text-[#0D205C]">{lab.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{lab.description}</p>
                        <div className="flex items-center text-sm font-bold text-[#6E97D1]">Bắt đầu <ArrowRight size={16} className="ml-1" /></div>
                    </div>
                ))}</div></div></div>
            )}
        </main>
      </div>
    </div>
  );
};

export default LabPage;