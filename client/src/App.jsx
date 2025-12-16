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
      id: 1,
      title: "Bài 1. Mô tả dao động",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai1.pdf" 
  },
  {
      id: 2,
      title: "Bài 2. Phương trình dao động điều hòa",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai2.pdf" 
  },
  {
      id: 3,
      title: "Bài 3. Năng lượng trong dao động điều hòa",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai3.pdf" 
  },
  {
      id: 4,
      title: "Bài 4. Dao động tắt dần và hiện tượng cộng hưởng",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai4.pdf" 
  },
  {
      id: 5,
      title: "Bài 5. Sóng và sự truyền sóng",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai5.pdf" 
  },
  {
      id: 6,
      title: "Bài 6. Các đặc trưng vật lí của sóng",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai6.pdf" 
  },
  {
      id: 7,
      title: "Bài 7. Sóng điện từ",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo", 
      path: "/books/bai7.pdf" 
  },
  {
      id: 8,
      title: "Bài 8. Giao thoa sóng",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai8.pdf" 
  },
  {
      id: 9,
      title: "Bài 9. Sóng dừng",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai9.pdf" 
  },
  {
      id: 10,
      title: "Bài 10. Thực hành đo tần số của sóng âm và tốc độ truyền âm",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai10.pdf" 
  },
  {
      id: 11,
      title: "Bài 11. Định luật Coulomb về tương tác tĩnh điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai11.pdf" 
  },
  {
      id: 12,
      title: "Bài 12. Điện trường",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai12.pdf" 
  },
  {
      id: 13,
      title: "Bài 13. Điện thế và thế năng điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai13.pdf" 
  },
  {
      id: 14,
      title: "Bài 14. Tụ điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai14.pdf" 
  },
  {
      id: 15,
      title: "Bài 15. Năng lượng và ứng dụng của tụ điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai15.pdf" 
  },
  {
      id: 16,
      title: "Bài 16. Dòng điện. Cường độ dòng điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai16.pdf" 
  },
  {
      id: 17,
      title: "Bài 17. Điện trở. Định luật Ohm",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai17.pdf" 
  },
  {
      id: 18,
      title: "Bài 18. Nguồn điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai18.pdf" 
  },
  {
      id: 19,
      title: "Bài 19. Năng lượng điện. Công suất điện",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai19.pdf" 
  },
  {
      id: 20,
      title: "Bài 20. Thực hành xác định suất điện động và điện trở trong của pin",
      description: "Sách giáo khoa vật lý lớp 11 - Chân trời sáng tạo",
      path: "/books/bai20.pdf" 
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
