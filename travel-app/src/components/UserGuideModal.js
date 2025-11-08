import React, { useState, useRef } from 'react';

const UserGuideModal = ({ show, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const modalContentRef = useRef(null);

  const pages = [
    {
      title: "🌍 사용 방법",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">👀 모드 설정</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              지구본을 <span className="font-semibold text-blue-400">🛰️ 위성 / 🌙 야간 / 🗺️ 지형 </span>모드 중 원하는 뷰로 자유롭게 변경할 수 있습니다.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              또한 <span className="font-semibold text-blue-400">+ / – 버튼</span> 또는 <span className="font-semibold text-blue-400">손가락 제스처</span>로 지구본의 크기를 조절할 수 있습니다.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">📊 여행 통계</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              지금까지의 <span className="font-semibold text-blue-400">총 여행 횟수, 방문 국가, 방문 도시</span>를 확인할 수 있습니다.
            </p>

            <h3 className="text-white text-ml font-semibold mb-2 text-base mt-2">전체 보기 - 🌏 전체 여행 기록</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              나의 모든 여행 기록을 시간 순으로 한눈에 볼 수 있습니다.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "🌍 사용 방법",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">🌏 대륙별 이동</h3>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              <span className="font-semibold text-blue-400">AS</span> 아시아 / <span className="font-semibold text-blue-400">EU</span> 유럽 / <span className="font-semibold text-blue-400">NA</span> 북아메리카 / <span className="font-semibold text-blue-400">SA</span> 남아메리카 / <span className="font-semibold text-blue-400">AF</span> 아프리카 / <span className="font-semibold text-blue-400">OC</span> 오세아니아
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              원하는 대륙으로 한 번에 이동할 수 있습니다.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 text-base">🎮 지구본 조작</h3>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="font-semibold text-white">🏠 홈</span> : 홈 국가로 즉시 이동
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="font-semibold text-white">🔄 회전</span> : 지구본 회전을 시작하거나 멈추기
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🌍 사용 방법",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">✈️ 여행지 추가</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              내가 방문한 <span className="font-semibold text-blue-400">국가 / 도시 / 시작·종료일</span>을 입력하여 추가하면 자동으로 나의 지구본에 기록이 저장됩니다.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">📝 여행 기록 수정 및 삭제</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              지구본이나 통계창에서 국가를 눌러 이동하면 여행 기록을 수정(✏️) · 삭제(🗑️)할 수 있습니다.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              전체 여행 기록 창에서도 언제든 기록을 관리할 수 있습니다.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "🌍 사용 방법",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">🛤️ 여행 경로 연결선</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              여행지를 추가하면, 홈 국가와 여행지가 자동으로 선으로 연결됩니다.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              <span className="font-semibold text-blue-400">여러 국가를 연속으로 여행한 경우</span>, 이전 여행이 끝난 국가와 다음 여행이 시작된 국가가 자동으로 연결됩니다.
            </p>
            <p className="text-gray-300 text-xs leading-relaxed mt-2">
              (홈 국가 → 첫 여행지 → … → 마지막 여행지 → 홈 국가 형식으로 이어집니다.)
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              <span className="font-semibold text-blue-400">여행 중 다른 국가를 잠시 방문한 경우</span>에도 동일한 형식으로 연결되어 표시됩니다.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 text-base">경로 연결 예시</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-xs mb-1">연속 여행</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  🇬🇧 영국 <span className="font-semibold text-xs">(2025-01-05~01-07)</span> → 🇩🇪 독일 <span className="font-semibold text-xs">(2025-01-07~01-13)</span>
                </p>
                <p className="text-blue-400 text-xs mt-1">→ 영국-독일 연결</p>
              </div>
              
              <div className="pt-3 border-t border-slate-700">
                <p className="text-gray-400 text-xs mb-1">중간 방문</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  🇭🇰 홍콩 <span className="font-semibold text-xs">(2025-10-01~10-04)</span> 여행 중 🇲🇴 마카오 <span className="font-semibold text-xs">(2025-10-02)</span> 방문 시
                </p>
                <p className="text-blue-400 text-xs mt-1">→ 홍콩–마카오 연결</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🌍 사용 방법",
      content: (
        <div className="space-y-4">

          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">🌐 개별 국가 보기</h3>
            <div className="text-gray-300 text-sm leading-relaxed space-y-1">
              <p>지구본이나 여행 통계창에서 국가를 누르면</p>
              <p>• 방문 횟수</p>
              <p>• 마지막 방문일</p>
              <p>• 방문 도시 목록</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">
              을 자세히 확인할 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 text-base">⚙️ 설정</h3>
            <div className="text-gray-300 text-sm leading-relaxed space-y-1">
              <p>• 홈 국가 변경</p>
              <p>• 비밀번호 변경</p>
              <p>• 사용 방법 안내 보기</p>
            </div>
          </div>
        </div>
        </div>
      )
    }
  ];

  const handleOverlayClick = (event) => {
    if (modalContentRef.current && !modalContentRef.current.contains(event.target)) {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentPage(0);
    onClose();
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={handleOverlayClick}
    >
      <div 
        className={`bg-slate-900/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20 ${
          (window.innerWidth <= 768 && window.innerHeight < window.innerWidth) ? 'mobile-landscape-modal' : 
          (window.innerWidth > 768 && window.innerWidth <= 1024 && window.innerHeight < window.innerWidth && 'ontouchstart' in window) ? 'iphone-pro-landscape-modal' :
          ''
        }`}
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">{pages[currentPage].title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="mb-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          {pages[currentPage].content}
        </div>

        {/* 페이지 인디케이터 */}
        <div className="flex justify-center items-center gap-2 mb-4">
          {pages.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentPage 
                  ? 'w-8 bg-blue-500' 
                  : 'w-2 bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="flex items-center justify-center w-12 h-12 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-gray-400 text-sm font-medium">
            {currentPage + 1} / {pages.length}
          </div>

          {currentPage === pages.length - 1 ? (
            <button
              onClick={handleClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
            >
              완료
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserGuideModal;