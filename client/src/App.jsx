// src/App.jsx
import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LabPage from './pages/LabPage';
import StudyPage from './pages/StudyPage'; // 1. Import trang Study
import AIAssistant from './components/AIAssistant'; // 2. Import AI Assistant

// 3. Khai báo danh sách sách (Dữ liệu tổng quát)
// Bạn có thể thêm bớt sách tại đây mà không cần sửa file StudyPage.jsx
const BOOKS_DATA = [
  {
      id: 11,
      title: "Định luật Coulomb về tương tác tĩnh điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/Lực_Tĩnh_Điện_và_Định_Luật_Coulomb.pdf" 
  },
  {
      id: 12,
      title: "Điện trường",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/Điện_Trường_Hé_Mở_Thế_Giới_Vô_Hình.pdf" 
  },
  {
      id: 15,
      title: "Năng lượng và ứng dụng của tụ điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/Lực_Tĩnh_Điện_và_Định_Luật_Coulomb.pdf" 
  },
  {
      id: 18,
      title: "Nguồn điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/Nguồn_Điện_Và_Bộ_Nguồn.pdf" 
  },
  {
      id: 19,
      title: "Năng lượng điện. Công suất điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/Năng_Lượng_Công_Suất_Điện.pdf" 
  },
  {
      id: 20,
      title: "Thực hành xác định suất điện động và điện trở trong của pin",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/Bí_Mật_Bên_Trong_Nguồn_Điện.pdf" 
  }
];

export default function App() {
  // Trạng thái hiện tại của trang: 'home', 'lab', hoặc 'study'
  const [currentPage, setCurrentPage] = useState('home');

  // --- CÁC HÀM CHUYỂN TRANG ---

  const goToHome = () => {
    window.scrollTo(0, 0);
    setCurrentPage('home');
  };

  const goToLab = () => {
    window.scrollTo(0, 0);
    setCurrentPage('lab');
  };

  const goToStudy = () => {
    window.scrollTo(0, 0);
    setCurrentPage('study');
  };

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="relative min-h-screen">
      
      {/* 1. TRANG CHỦ (LANDING PAGE) */}
      {/* Truyền cả 2 hàm điều hướng: Lab và Study */}
      {currentPage === 'home' && (
        <LandingPage 
          onNavigateHome={goToHome}
          onNavigateToLab={goToLab} 
          onNavigateToStudy={goToStudy} 
        />
      )}
      
      {/* 2. TRANG THÍ NGHIỆM (LAB) */}
      {currentPage === 'lab' && (
        <LabPage onBackToHome={goToHome} />
      )}

      {/* 3. TRANG TÀI LIỆU (STUDY) */}
      {/* Truyền danh sách sách vào đây */}
      {currentPage === 'study' && (
        <StudyPage 
          onBack={goToHome} 
          books={BOOKS_DATA} 
        />
      )}

      {/* 4. AI ASSISTANT (LUÔN HIỂN THỊ) */}
      {/* Đặt ở cuối để nổi lên trên tất cả các trang */}
      <AIAssistant />
      
    </div>
  );
}