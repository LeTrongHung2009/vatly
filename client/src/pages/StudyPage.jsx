import React, { useState, useEffect } from 'react';
import { Book, ChevronLeft, Menu, FileText, AlertCircle } from 'lucide-react';

// Component nhận vào danh sách sách thông qua props "books"
const StudyPage = ({ onBack, books = [] }) => {
  // State lưu cuốn sách đang chọn (khởi tạo là null nếu không có sách)
  const [currentBook, setCurrentBook] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Effect: Khi danh sách sách thay đổi (hoặc mới vào trang), tự động chọn cuốn đầu tiên
  useEffect(() => {
    if (books && books.length > 0) {
      setCurrentBook(books[0]);
    } else {
      setCurrentBook(null);
    }
  }, [books]);

  return (
    <div className="h-screen flex flex-col bg-[#F7F2EE] overflow-hidden">
      {/* --- HEADER --- */}
      <div className="bg-[#0D205C] text-white p-4 shadow-md flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm"
          >
            <ChevronLeft size={20} /> Quay lại
          </button>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <span className="font-bold flex items-center gap-2">
            <Book size={18} className="text-[#6E97D1]"/> 
            Thư viện Học liệu
          </span>
        </div>
        
        {/* Nút menu mobile */}
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden p-2">
          <Menu size={20} />
        </button>
      </div>

      {/* --- BODY --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- SIDEBAR: DANH SÁCH SÁCH --- */}
        <aside className={`
            absolute md:relative z-10 h-full bg-white border-r border-[#0D205C]/10 w-64 transition-all duration-300 shadow-xl md:shadow-none flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-72'}
        `}>
          <div className="p-4 bg-[#F7F2EE]/50 border-b border-[#0D205C]/5 flex justify-between items-center">
            <h3 className="font-bold text-[#0D205C] text-sm uppercase tracking-wider">Danh mục tài liệu</h3>
            <span className="text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded border">
              {books.length} file
            </span>
          </div>
          
          <div className="overflow-y-auto h-full p-2 space-y-1 pb-20">
            {/* Kiểm tra: Nếu có sách thì map, không có thì hiện thông báo */}
            {books.length > 0 ? (
              books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => {
                      setCurrentBook(book);
                      if(window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition-all group
                    ${currentBook?.id === book.id 
                      ? 'bg-[#0D205C] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-[#6E97D1]/10 hover:text-[#0D205C]'}
                  `}
                >
                  <FileText size={16} className={`mt-1 flex-shrink-0 transition-colors ${currentBook?.id === book.id ? 'text-[#6E97D1]' : 'text-gray-400 group-hover:text-[#0D205C]'}`} />
                  <div className="flex flex-col">
                    <span className="font-medium line-clamp-2 leading-snug">{book.title}</span>
                    {/* Nếu sách có thêm mô tả ngắn hoặc tác giả, có thể hiển thị ở đây */}
                    {book.description && <span className="text-[10px] opacity-70 mt-1 truncate">{book.description}</span>}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <AlertCircle size={24} />
                <span>Chưa có tài liệu nào được cập nhật.</span>
              </div>
            )}
          </div>
        </aside>

        {/* --- MAIN: PDF VIEWER --- */}
        <main className="flex-1 bg-gray-100 relative w-full h-full">
            {currentBook ? (
              <iframe
                  src={currentBook.path}
                  title={currentBook.title}
                  className="w-full h-full border-none"
                  style={{ display: 'block' }}
              />
            ) : (
              // Trạng thái chờ hoặc danh sách rỗng
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-[#F7F2EE]">
                  <Book size={48} className="mb-4 text-[#0D205C]/20" />
                  <p>Vui lòng chọn một tài liệu từ danh sách</p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default StudyPage;