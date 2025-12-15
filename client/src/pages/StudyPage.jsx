import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, ChevronLeft, FileText, AlertCircle, Play, Pause, SkipBack, SkipForward, Search, ZoomIn, ZoomOut, X, Sidebar as SidebarIcon } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';

// --- Cấu hình Worker ---
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const StudyPage = ({ onBack, books = [] }) => {
  const [currentBook, setCurrentBook] = useState(null);
  // Mặc định đóng Sidebar
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // State kiểm tra màn hình Desktop (> 640px)
  const [isDesktop, setIsDesktop] = useState(true);

  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputPage, setInputPage] = useState('');
  const [scale, setScale] = useState(1);

  // Kiểm tra kích thước màn hình để xác định Desktop/Mobile
  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // --- 1. TÍNH TOÁN KÍCH THƯỚC SLIDE ---
  const [bookDimensions, setBookDimensions] = useState({ width: 800, height: 450 });

  const calculateSize = useCallback(() => {
    const ASPECT_RATIO = 16 / 9; 

    // Chỉ trừ hao Sidebar nếu đang mở VÀ đang ở trên Desktop
    // Trên Mobile sidebar phủ lên trên (overlay) nên không ảnh hưởng width
    const sidebarWidth = (isSidebarOpen && isDesktop) ? 280 : 0;
    
    const paddingX = sidebarWidth + 60; // 60px là lề cơ bản
    const paddingY = 140; // Header + Footer controls

    const maxWidth = window.innerWidth - paddingX;
    const maxHeight = window.innerHeight - paddingY;

    let height = maxHeight;
    let width = height * ASPECT_RATIO;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / ASPECT_RATIO;
    }

    width = Math.floor(width);
    height = Math.floor(height);

    setBookDimensions({ width, height });
  }, [isSidebarOpen, isDesktop]);

  useEffect(() => {
    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [calculateSize]);

  const bookRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (books && books.length > 0) setCurrentBook(books[0]);
    else setCurrentBook(null);
  }, [books]);

  useEffect(() => {
    setNumPages(null); setCurrentPage(0); setIsPlaying(false); setInputPage(''); setScale(1);
  }, [currentBook]);

  // --- 2. XỬ LÝ PHÍM ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!bookRef.current || !numPages) return;
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
         e.preventDefault();
      }
      if (e.key === 'ArrowRight') bookRef.current.pageFlip().flipNext();
      else if (e.key === 'ArrowLeft') bookRef.current.pageFlip().flipPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      autoPlayRef.current = setInterval(() => {
        if (bookRef.current && currentPage < (numPages - 1)) {
            bookRef.current.pageFlip().flipNext();
        } else {
            setIsPlaying(false);
        }
      }, 3000);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPlaying, currentPage, numPages]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
  const onFlip = (e) => setCurrentPage(e.data);
  const handleNext = () => bookRef.current?.pageFlip().flipNext();
  const handlePrev = () => bookRef.current?.pageFlip().flipPrev();

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const pageNum = parseInt(inputPage, 10);
    if (pageNum >= 1 && pageNum <= numPages && bookRef.current) {
      bookRef.current.pageFlip().turnToPage(pageNum - 1);
      setInputPage('');
    } else {
      alert(`Nhập trang từ 1 đến ${numPages}`);
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1d] overflow-hidden relative text-gray-200 font-sans">
      
      <style>{`
        .react-pdf__Page__canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        .react-pdf__Page {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
      `}</style>

      {/* HEADER */}
      <div className="bg-[#0D205C] text-white p-3 shadow-lg flex items-center justify-between z-50 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full flex items-center gap-2 text-sm transition">
            <ChevronLeft size={20} /> <span className="hidden sm:inline">Quay lại</span>
          </button>
          <div className="h-6 w-[1px] bg-white/20 hidden sm:block"></div>
          <span className="font-bold flex items-center gap-2 text-sm sm:text-base tracking-wide">
            <Book size={18} className="text-[#6E97D1]"/> Thư viện Số
          </span>
        </div>
        
        <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className={`p-2 rounded-lg flex items-center gap-2 transition ${isSidebarOpen ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
        >
          {isSidebarOpen ? <X size={20} /> : <SidebarIcon size={20} />}
          <span className="text-xs font-medium hidden sm:inline">Danh sách</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* === MOBILE OVERLAY (Lớp phủ đen khi mở menu trên điện thoại) === */}
        <div 
          className={`
            fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 sm:hidden
            ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
          `}
          onClick={() => setSidebarOpen(false)}
        />

        {/* === SIDEBAR (Responsive Logic) === */}
        <aside 
            className={`
                bg-white text-gray-800 border-[#0D205C]/10 flex flex-col transition-all duration-300 ease-in-out shadow-2xl z-50

                /* MOBILE: Fixed Bottom Sheet (Hiện từ dưới lên) */
                fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-2xl border-t
                ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}

                /* DESKTOP: Absolute Left Sidebar (Hiện từ trái sang) */
                sm:absolute sm:top-0 sm:left-0 sm:h-full sm:w-[280px] sm:rounded-none sm:border-r sm:border-t-0 sm:bottom-auto sm:translate-y-0
                ${isSidebarOpen ? 'sm:translate-x-0' : 'sm:-translate-x-full'}
            `}
        >
          <div className="p-4 bg-[#F7F2EE]/50 border-b border-[#0D205C]/5 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-[#0D205C] text-xs uppercase tracking-wider">Danh mục tài liệu</h3>
            <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border shadow-sm">{books.length} file</span>
            {/* Nút đóng cho Mobile */}
            <button onClick={() => setSidebarOpen(false)} className="sm:hidden p-1 text-gray-400 hover:text-red-500">
               <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1 pb-10">
            {books.length > 0 ? (
              books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => {
                    setCurrentBook(book);
                    if (!isDesktop) setSidebarOpen(false); // Đóng menu sau khi chọn trên mobile
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm flex items-start gap-3 transition group border border-transparent ${currentBook?.id === book.id ? 'bg-[#0D205C] text-white shadow-md border-[#0D205C]' : 'text-gray-600 hover:bg-[#6E97D1]/10 hover:border-[#6E97D1]/20'}`}
                >
                  <FileText size={18} className={`mt-0.5 flex-shrink-0 ${currentBook?.id === book.id ? 'text-[#6E97D1]' : 'text-gray-400 group-hover:text-[#0D205C]'}`} />
                  <div className="flex flex-col min-w-0"><span className="font-medium line-clamp-2 leading-snug">{book.title}</span></div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3"><AlertCircle size={32} className="opacity-50" /><span>Chưa có dữ liệu.</span></div>
            )}
          </div>
        </aside>

        {/* MAIN VIEWER */}
        <main 
            className="flex-1 bg-[#2e2e33] relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
            style={{ 
              // Chỉ đẩy nội dung sang phải khi ở Desktop
              marginLeft: (isSidebarOpen && isDesktop) ? '280px' : '0' 
            }}
        >
            {currentBook ? (
              <>
                <div className="flex-1 w-full h-full flex justify-center items-center p-4 overflow-hidden relative">
                  <div 
                    style={{ 
                        transform: `scale(${scale})`, 
                        transition: 'transform 0.2s ease-out',
                        transformOrigin: 'center center',
                        width: bookDimensions.width,
                        height: bookDimensions.height
                    }}
                    className="flex justify-center items-center shadow-2xl"
                  >
                      <Document
                        file={currentBook.path}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div className="flex flex-col items-center text-white/70 gap-2"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Đang tải...</span></div>}
                        className="flex justify-center items-center"
                      >
                        {numPages && (
                          <HTMLFlipBook
                            width={bookDimensions.width} 
                            height={bookDimensions.height} 
                            usePortrait={true} 
                            showCover={false} 
                            size="fixed"
                            minWidth={300} maxWidth={1600} minHeight={200} maxHeight={1000}
                            maxShadowOpacity={0.3} 
                            drawShadow={true}
                            flippingTime={800} 
                            ref={bookRef}
                            onFlip={onFlip}
                            className="shadow-2xl outline-none"
                            style={{ margin: '0 auto' }}
                          >
                            {Array.from(new Array(numPages), (el, index) => (
                              <div key={`page_${index + 1}`} className="bg-white overflow-hidden rounded-sm w-full h-full">
                                <div className="w-full h-full flex justify-center items-center relative">
                                    <Page 
                                        key={`page_content_${index + 1}_${bookDimensions.width}`}
                                        pageNumber={index + 1} 
                                        width={bookDimensions.width} 
                                        height={bookDimensions.height}
                                        renderTextLayer={false}      
                                        renderAnnotationLayer={false}
                                        className="pointer-events-none"
                                    />
                                    <div className="absolute bottom-2 right-4 text-[10px] text-gray-500 font-mono select-none bg-white/90 px-2 py-0.5 rounded-full border border-gray-100 shadow-sm z-10">
                                        {index + 1} / {numPages}
                                    </div>
                                </div>
                              </div>
                            ))}
                          </HTMLFlipBook>
                        )}
                      </Document>
                  </div>
                </div>

                {/* THANH ĐIỀU KHIỂN */}
                {numPages && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-white/40 z-30 text-gray-800 transition hover:scale-105">
                      
                      <div className="flex items-center gap-1 border-r pr-3 mr-1 border-gray-300">
                        <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600"><ZoomOut size={16}/></button>
                        <span className="text-xs font-mono w-9 text-center font-bold text-gray-500">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600"><ZoomIn size={16}/></button>
                      </div>

                      <button onClick={handlePrev} disabled={currentPage === 0} className="p-2 hover:bg-[#0D205C] hover:text-white rounded-full transition disabled:opacity-30 text-[#0D205C]">
                          <SkipBack size={20} />
                      </button>
                      
                      <span className="text-sm font-bold text-[#0D205C] min-w-[60px] text-center font-mono select-none">
                          {currentPage + 1}
                      </span>
                      
                      <button onClick={handleNext} disabled={currentPage === (numPages - 1)} className="p-2 hover:bg-[#0D205C] hover:text-white rounded-full transition disabled:opacity-30 text-[#0D205C]">
                          <SkipForward size={20} />
                      </button>

                      <div className="h-6 w-[1px] bg-gray-300 mx-1"></div>

                      <button onClick={() => setIsPlaying(!isPlaying)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${isPlaying ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-[#0D205C] hover:bg-gray-100 border border-gray-200'}`}>
                          {isPlaying ? <><Pause size={14} className="animate-pulse"/> Dừng</> : <><Play size={14} /> Auto</>}
                      </button>

                      <form onSubmit={handleJumpToPage} className="hidden sm:flex items-center bg-gray-100 rounded-full px-2 py-1 ml-2 border border-transparent focus-within:border-[#0D205C]/30">
                          <input type="number" min="1" max={numPages} value={inputPage} onChange={(e) => setInputPage(e.target.value)} placeholder="..." className="w-10 bg-transparent text-sm focus:outline-none text-center font-bold text-[#0D205C]" />
                          <button type="submit" className="text-[#0D205C] hover:text-blue-600 p-1 rounded-full"><Search size={14} /></button>
                      </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500/50 select-none">
                  <Book size={48} strokeWidth={1} className="mb-4 opacity-50"/>
                  <p className="text-lg font-light">Chọn tài liệu từ danh sách</p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default StudyPage;