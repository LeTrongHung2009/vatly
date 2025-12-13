import React from 'react';
import { Atom, BookOpen, FlaskConical, ChevronRight } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import AIAssistant from '../components/AIAssistant';

// 👇 ĐÃ SỬA: Thêm onNavigateHome vào danh sách props
const LandingPage = ({ onNavigateToLab, onNavigateToStudy, onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-[#F7F2EE] text-[#0D205C] font-sans selection:bg-[#6E97D1] selection:text-white pb-20">
      
      {/* Header - Truyền đủ 3 hàm điều hướng */}
      <PublicNavbar 
        onNavigateHome={onNavigateHome}
        onNavigateStudy={onNavigateToStudy}
        onNavigateLab={onNavigateToLab}
      />

      {/* Main Body */}
      <main className="pt-28 px-6 max-w-6xl mx-auto">
        
        {/* --- HERO SECTION --- */}
        <section className="bg-[#0D205C] rounded-3xl p-8 md:p-16 text-white shadow-2xl shadow-[#0D205C]/20 relative overflow-hidden mb-12 group">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-[#6E97D1]/20 border border-[#6E97D1]/30 text-[#6E97D1] text-xs font-bold tracking-wider mb-6">
              PROJECT LỚP 11L05
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Hệ thống Học liệu <br/>
            </h1>
          </div>

          {/* Background Animation */}
          <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-[#6E97D1]/10 to-transparent pointer-events-none"></div>
          <Atom className="absolute -right-20 -bottom-20 w-80 h-80 text-[#6E97D1]/5 animate-[spin_20s_linear_infinite]" />
        </section>

        {/* --- CARDS SECTION: ĐIỀU HƯỚNG --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          
          {/* Card 1: VÀO HỌC (StudyPage) */}
          <div 
            onClick={onNavigateToStudy}
            className="group relative bg-white rounded-3xl p-8 border border-[#0D205C]/5 hover:border-[#6E97D1] transition-all hover:shadow-xl cursor-pointer overflow-hidden h-72 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 translate-x-10 -translate-y-10">
              <BookOpen size={160} className="text-[#6E97D1]" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#F7F2EE] rounded-2xl flex items-center justify-center mb-6 text-[#0D205C] group-hover:bg-[#0D205C] group-hover:text-white transition-colors">
                <BookOpen size={28} />
              </div>
              <h2 className="text-3xl font-bold text-[#0D205C] mb-3">Vào Học</h2>
              <p className="text-gray-500 group-hover:text-[#0D205C]/80 transition-colors">
                Thư viện SGK điện tử, Video bài giảng và Tóm tắt kiến thức dạng Infographic.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[#6E97D1] font-bold group-hover:translate-x-2 transition-transform">
              Xem tài liệu <ChevronRight size={20} />
            </div>
          </div>

          {/* Card 2: PHÒNG LAB ẢO (LabPage) */}
          <div 
            onClick={onNavigateToLab}
            className="group relative bg-white rounded-3xl p-8 border border-[#0D205C]/5 hover:border-[#6E97D1] transition-all hover:shadow-xl cursor-pointer overflow-hidden h-72 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 translate-x-10 -translate-y-10">
              <FlaskConical size={160} className="text-[#6E97D1]" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#F7F2EE] rounded-2xl flex items-center justify-center mb-6 text-[#0D205C] group-hover:bg-[#0D205C] group-hover:text-white transition-colors">
                <FlaskConical size={28} />
              </div>
              <h2 className="text-3xl font-bold text-[#0D205C] mb-3">Phòng Lab Ảo</h2>
              <p className="text-gray-500 group-hover:text-[#0D205C]/80 transition-colors">
                Thực hành thí nghiệm ảo WebGL, đo đạc số liệu và làm bài tập trắc nghiệm.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[#6E97D1] font-bold group-hover:translate-x-2 transition-transform">
              Bắt đầu thí nghiệm <ChevronRight size={20} />
            </div>
          </div>

        </section>

      </main>

      {/* AI Helper */}
      <AIAssistant />

    </div>
  );
};

export default LandingPage;
