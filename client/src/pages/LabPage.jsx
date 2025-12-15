import React, { useState, useEffect } from 'react';
import { FlaskConical, ChevronLeft, Menu, Atom, ArrowRight, X, Sidebar as SidebarIcon } from 'lucide-react';

// Import các component con (Giữ nguyên như code cũ của bạn)
import UniversalPhysicsSandbox from '../components/simulations/PhysicsSandboxV16';
import { labs } from '../src/data/labs';

// Component Placeholder nếu chưa có (để code chạy được demo)
const PendulumSim = () => <div className="flex items-center justify-center h-full text-gray-400">Pendulum Simulation</div>;
const WaveInterferenceLab = () => <div className="flex items-center justify-center h-full text-gray-400">Wave Simulation</div>;

const LabPage = ({ onBackToHome }) => {
  const [activeLab, setActiveLab] = useState(null);
  
  // --- 1. STATE MỚI: QUẢN LÝ SIDEBAR & DESKTOP ---
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mặc định đóng
  const [isDesktop, setIsDesktop] = useState(true);

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkScreen = () => {
      // md breakpoint của Tailwind là 768px
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // --- LOGIC: FULL SCREEN SANDBOX (Giữ nguyên) ---
  if (activeLab?.id === 'sandbox') {
    return (
      <div className="relative w-screen h-screen bg-white">
        <button 
          onClick={() => setActiveLab(null)}
          className="fixed top-4 right-4 z-[100] bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-lg text-xs font-bold"
        >
          Thoát thí nghiệm
        </button>
        <UniversalPhysicsSandbox />
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="h-screen flex flex-col bg-[#F7F2EE] overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-[#0D205C] text-white p-4 shadow-md flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBackToHome} className="p-2 hover:bg-white/10 rounded-full flex items-center gap-2 text-sm transition">
            <ChevronLeft size={20} /> <span className="hidden sm:inline">Quay lại</span>
          </button>
          <div className="h-6 w-[1px] bg-white/20 hidden sm:block"></div>
          <span className="font-bold flex items-center gap-2">
            <FlaskConical size={18} className="text-[#6E97D1]"/> Phòng Lab Ảo
          </span>
        </div>
        
        {/* Nút Toggle Sidebar (Hiện trên cả Mobile và Desktop) */}
        <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className={`p-2 rounded-lg flex items-center gap-2 transition ${isSidebarOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
          {isSidebarOpen ? <X size={20} /> : <SidebarIcon size={20} />}
          <span className="text-xs font-medium hidden sm:inline">Danh sách bài</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* === MOBILE OVERLAY (Lớp phủ đen khi mở menu trên điện thoại) === */}
        <div 
          className={`
            fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden
            ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
          `}
          onClick={() => setSidebarOpen(false)}
        />

        {/* === SIDEBAR (Responsive Logic) === */}
        <aside 
            className={`
                bg-white border-[#0D205C]/10 flex flex-col transition-all duration-300 ease-in-out shadow-2xl z-50

                /* MOBILE: Fixed Bottom Sheet (Hiện từ dưới lên) */
                fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-2xl border-t
                ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}

                /* DESKTOP: Absolute Left Sidebar (Hiện từ trái sang) */
                md:absolute md:top-0 md:left-0 md:h-full md:w-80 md:rounded-none md:border-r md:bottom-auto md:translate-y-0
                ${isSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
            `}
        >
          <div className="p-4 bg-[#F7F2EE]/50 border-b flex justify-between items-center shrink-0">
            <h3 className="font-bold text-[#0D205C] text-sm uppercase">Danh sách thí nghiệm</h3>
            <span className="text-xs bg-white border px-2 py-0.5 rounded shadow-sm">{labs.length}</span>
             {/* Nút đóng cho Mobile */}
             <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-red-500">
               <X size={20} />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1 pb-10">
            {labs.map((lab) => (
              <button 
                key={lab.id} 
                onClick={() => {
                    setActiveLab(lab);
                    if (!isDesktop) setSidebarOpen(false); // Đóng menu nếu đang ở mobile
                }} 
                className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-all ${activeLab?.id === lab.id ? 'bg-[#0D205C] text-white shadow-md' : 'text-gray-600 hover:bg-[#6E97D1]/10'}`}
              >
                <div className="mt-1"><Atom size={16} /></div>
                <div>
                    <span className="font-bold line-clamp-1">{lab.title}</span>
                    <span className={`text-[10px] uppercase block mt-0.5 ${activeLab?.id === lab.id ? 'text-white/70' : 'text-gray-400'}`}>{lab.category}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main 
            className="flex-1 bg-gray-50 relative w-full h-full overflow-hidden flex flex-col transition-all duration-300"
            style={{ 
              // Chỉ đẩy nội dung sang phải khi ở Desktop VÀ Sidebar mở
              marginLeft: (isSidebarOpen && isDesktop) ? '320px' : '0' 
            }}
        >
            {activeLab ? (
                <div className="w-full h-full flex flex-col">
                    <div className="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0 shadow-sm">
                        <h2 className="text-xl font-bold text-[#0D205C]">{activeLab.title}</h2>
                        <span className="px-3 py-1 bg-[#E6F4F1] text-[#0D655C] text-xs font-bold rounded-full border border-[#0D655C]/20">WebGL Sim</span>
                    </div>
                    <div className="flex-1 bg-[#F0F4F8] p-4 overflow-auto flex items-center justify-center relative">
                        {/* Render nội dung bài học */}
                        {activeLab.id === 'pendulum' ? (
                            <div className="w-full h-full bg-white rounded-2xl border shadow-sm overflow-hidden"><PendulumSim /></div>
                        ) : activeLab.id === 'interference' ? (
                            <div className="w-full h-full bg-white rounded-2xl border shadow-sm overflow-hidden"><WaveInterferenceLab /></div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 bg-white w-full h-full rounded-2xl border border-dashed">
                                <Atom size={48} className="mb-2 opacity-20"/>
                                <span>Đang tải mô phỏng...</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Dashboard khi chưa chọn bài
                <div className="w-full h-full overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-[#0D205C] mb-2">Thư viện Thí nghiệm</h2>
                            <p className="text-gray-500">Chọn một bài thí nghiệm từ danh sách để bắt đầu.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                            {labs.map((lab) => (
                                <div 
                                    key={lab.id} 
                                    onClick={() => setActiveLab(lab)} 
                                    className="group bg-white rounded-2xl p-6 border border-[#0D205C]/5 hover:shadow-xl hover:border-[#6E97D1]/30 cursor-pointer transition-all duration-200"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-[#0D205C] rounded-xl group-hover:bg-[#0D205C] group-hover:text-white transition-colors">
                                            <Atom size={24} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">{lab.category}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#0D205C] mb-2 group-hover:text-[#6E97D1] transition-colors">{lab.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{lab.description}</p>
                                    <div className="flex items-center text-sm font-bold text-[#6E97D1] group-hover:translate-x-1 transition-transform">
                                        Bắt đầu <ArrowRight size={16} className="ml-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default LabPage;