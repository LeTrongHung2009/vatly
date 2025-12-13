import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [answer, setAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const assistantRef = useRef(null);

  // ⚠️ BẢO MẬT: Key cũ của bạn đã bị lộ. Hãy tạo Key mới tại https://aistudio.google.com/
  // Sau đó dán Key mới vào dòng dưới đây:
  const API_KEY = 'AIzaSyCKJfhUWtQUlVIkULk7suGPOY2V1XAgbm4'; 

  useEffect(() => {
    const handleMouseUp = (event) => {
      // 1. Ngăn chặn trigger khi click vào chính khung Assistant
      if (assistantRef.current && assistantRef.current.contains(event.target)) {
        return;
      }

      // 2. Lấy text bôi đen
      const text = window.getSelection().toString().trim();
      
      // 3. Chỉ kích hoạt khi text có nội dung thực sự
      if (text.length > 1) {
        setSelectedText(text);
        setIsOpen(true);
        handleGeminiExplain(text);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleGeminiExplain = async (text) => {
    setIsThinking(true);
    setAnswer('');

    try {
      const prompt = `Giải thích ngắn gọn: "${text}"`;

      // CÁCH KHẮC PHỤC:
      // 1. Dùng v1beta
      // 2. Dùng tên đầy đủ phiên bản: gemini-1.5-flash-001 (thay vì chỉ flash)
      // Lưu ý: Đảm bảo biến API_KEY ở trên đã chứa key đúng (bắt đầu bằng AIza...)
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Log lỗi chi tiết ra để xem nó đòi model gì
        console.error("DEBUG - Lỗi Google trả về:", data);
        
        // Nếu vẫn lỗi 404 model, thử fallback sang gemini-pro (model đời cũ nhưng ổn định)
        if (data.error?.code === 404) {
           throw new Error("Không tìm thấy model Flash. Hãy thử đổi URL sang 'models/gemini-pro'");
        }
        throw new Error(data.error?.message || response.statusText);
      }

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAnswer(aiResponse || "Không có nội dung trả lời.");

    } catch (error) {
      console.error("Lỗi:", error);
      setAnswer(`⚠️ Lỗi: ${error.message}. \n(Hãy F12 xem Console để biết chi tiết lỗi)`);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={assistantRef} className="fixed bottom-6 right-6 z-50 animate-bounce-in font-sans">
      <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-[#0D205C]/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0D205C] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#6E97D1]" />
            <span className="font-bold">Trợ lý AI Gemini</span>
          </div>
          <button 
            onClick={() => { 
              setIsOpen(false); 
              window.getSelection().removeAllRanges(); // Bỏ bôi đen khi đóng
            }} 
            className="hover:text-[#6E97D1] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 bg-[#F7F2EE] min-h-[150px] max-h-[400px] overflow-y-auto text-sm text-[#0D205C]">
          <div className="mb-3">
            <span className="text-[10px] text-[#6E97D1] uppercase font-bold tracking-wider">Đang giải thích:</span>
            <div className="bg-white p-2 rounded border border-[#6E97D1]/30 mt-1 italic text-gray-600 border-l-2 border-l-[#6E97D1] line-clamp-2">
              "{selectedText}"
            </div>
          </div>

          {isThinking ? (
            <div className="flex flex-col items-center justify-center gap-2 text-[#6E97D1] mt-6 mb-4">
              <svg className="animate-spin h-6 w-6 text-[#6E97D1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs font-medium">Đang phân tích dữ liệu...</span>
            </div>
          ) : (
            <div className="bg-white p-3 rounded-xl shadow-sm mt-2 text-gray-800 leading-relaxed whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;