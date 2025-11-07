import React from 'react';

const WelcomeModal = ({ show, onClose, onSignIn }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div 
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        style={{
          maxHeight: '90vh',
          maxHeight: '90dvh'
        }}
      >
        {/* 배경 장식 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        {/* 컨텐츠 */}
        <div className="relative p-6 sm:p-8 overflow-y-auto" style={{ maxHeight: '90vh', maxHeight: '90dvh' }}>
          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-2 text-gray-400 hover:text-white transition-colors duration-200 z-10"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 헤더 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              나의 여행 저장소 - My Travel Archive
            </h2>
          </div>

          {/* 구분선 */}
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>


          {/* STEP 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 mb-4 border border-white/10">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                  계정 등록
                </h4>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  ⚠️ <span className="text-yellow-400 font-semibold">원활한 여행 기록 저장을 위해 로그인이 필요해요!</span>
                </p>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mt-2">
                  아래 <span className="font-semibold text-blue-400">Sign In</span> 버튼을 눌러 간편하게 계정을 만들어보세요.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 mb-6 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                  기록 시작! 🎉
                </h4>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  로그인 완료 후 바로 여행 기록을 시작할 수 있어요.
                </p>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mt-2">
                  - 설정창(⚙️)에서 <span className="font-semibold text-blue-400">사용 방법</span>을 확인하고 더 편리하게 이용해 보세요.
                </p>
              </div>
            </div>
          </div>

          {/* Sign In 버튼 */}
          <button
            onClick={onSignIn}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg mb-3"
          >
            Sign In
          </button>

        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
