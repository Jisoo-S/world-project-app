import React, { useRef, useEffect } from 'react';

const GlobeControls = ({
  isMobile,
  isLandscape,
  globeMode,
  changeGlobeMode,
  zoomLevel,
  setZoomLevel,
  globeRef,
  resetView,
  toggleRotation,
  goToCountry,
  userTravelData,
  showContinentPanel,
  setShowContinentPanel,
  selectedLine,
  selectedCountry
}) => {
  const isMobileLandscape = isMobile && isLandscape;
  // 아이폰 프로/프로맥스 등 큰 모바일 기기 가로모드 감지
  const isLargeMobileLandscape = window.innerWidth > 1024 && window.innerWidth <= 1280 && isLandscape && 'ontouchstart' in window;
  const isAnyMobile = isMobile || isLargeMobileLandscape;
  const continentPanelRef = useRef(null);

  // 외부 클릭 감지 (모바일 대륙 패널)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (continentPanelRef.current && !continentPanelRef.current.contains(event.target)) {
        setShowContinentPanel(false);
      }
    };

    // 모든 모바일 환경(세로, 가로 포함)에서 외부 클릭 감지 적용
    if (showContinentPanel && isAnyMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); // 터치 이벤트도 추가
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showContinentPanel, setShowContinentPanel, isAnyMobile]);

  const continents = [
    { continent: 'Asia', flag: 'AS', countries: ['South Korea', 'Japan'], description: 'AS' },
    { continent: 'Europe', flag: 'EU', countries: ['France', 'Italy', 'Germany'], description: 'EU' },
    { continent: 'North America', flag: 'NA', countries: ['United States'], description: 'NA' },
    { continent: 'South America', flag: 'SA', countries: [], description: 'SA' },
    { continent: 'Africa', flag: 'AF', countries: [], description: 'AF' },
    { continent: 'Oceania', flag: 'OC', countries: [], description: 'OC' }
  ];

  const handleContinentClick = (continent, countries) => {
    const continentAltitude = 5.0; // More zoomed out for continents
    const continentCoords = {
      'Asia': [34, 100],           // 중국 중부
      'Europe': [54, 25],          // 동유럽 중심
      'North America': [54, -105], // 캐나다-미국 중심
      'South America': [-8, -55],  // 브라질 중심
      'Africa': [1, 20],           // 중앙아프리카
      'Oceania': [-25, 135]        // 호주 중심
    };
    if (globeRef.current && continentCoords[continent]) {
      globeRef.current.pointOfView({ 
        lat: continentCoords[continent][0], 
        lng: continentCoords[continent][1], 
        altitude: continentAltitude 
      });
    }
    // 모든 모바일 환경(세로, 가로 포함)에서 패널 닫기
    if (isAnyMobile) {
      setShowContinentPanel(false);
    }
  };

  return (
    <>
  {/* 지구본 모드 선택 및 줌 컨트롤 */}
      {/* 💡 변경점: 가로모드에서 숨기는 조건문 {(!isAnyMobile || !isLandscape) && ( 을 완전히 삭제했습니다! */}
      <div className="absolute z-20"
        style={{
          left: '1.5%',
          top: isMobile && !isLandscape ? 'calc(env(safe-area-inset-top, 0px) + 8px)' :  // 모바일 세로모드 - 상태바 바로 아래
               isMobile && isLandscape ? '2%' :   // 모바일 가로모드
               '2%'                               // 데스크톱
        }}
      >
        {/* 지구본 모드 선택 */}
        <div className={`bg-slate-900/95 backdrop-blur-lg shadow-2xl border border-white/20 ${
          isAnyMobile
            ? 'rounded-xl p-2.5 w-24'
            : 'rounded-2xl p-2.5 w-32'
        }`}>
          <div className={`text-white font-medium mb-2 ${
            isAnyMobile ? 'text-xs' : 'text-sm font-bold mb-3'
          }`}>👀 모드</div>
            <div className={isMobile ? 'space-y-1' : 'space-y-1.5'}>
              <button
                onClick={() => changeGlobeMode('satellite')}
                className={`w-full font-medium transition-all ${
                  isAnyMobile 
                    ? 'px-1.5 py-1 rounded-md text-xs' 
                    : 'px-3 py-1.5 rounded-lg text-xs'
                } ${
                  globeMode === 'satellite' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                🛰️ 위성 
              </button>
              <button
                onClick={() => changeGlobeMode('night')}
                className={`w-full font-medium transition-all ${
                  isAnyMobile 
                    ? 'px-1.5 py-1 rounded-md text-xs' 
                    : 'px-3 py-1.5 rounded-lg text-xs'
                } ${
                  globeMode === 'night' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                🌙 야간 
              </button>
              <button
                onClick={() => changeGlobeMode('topographic')}
                className={`w-full font-medium transition-all ${
                  isAnyMobile 
                    ? 'px-1.5 py-1 rounded-md text-xs' 
                    : 'px-3 py-1.5 rounded-lg text-xs'
                } ${
                  globeMode === 'topographic' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                🗺️ 지형 
              </button>
            </div>
            
            {/* 줌 컨트롤 버튼들을 모드 박스 안에 */}
<div className={`flex flex-row gap-1 items-center justify-center w-full ${isAnyMobile ? 'mt-2' : 'mt-3'}`}>
  <button
    onClick={() => { if (globeRef.current) globeRef.current.zoomOut(); }}
    className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center h-8 ${isAnyMobile ? 'text-xs' : 'text-sm'}`}
  >
    +
  </button>
  <button
    onClick={() => { if (globeRef.current) globeRef.current.zoomIn(); }}
    className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center h-8 ${isAnyMobile ? 'text-xs' : 'text-sm'}`}
  >
    -
  </button>
        </div>
          </div>
        </div>


{/* 컨트롤 패널 */}
      {isAnyMobile ? (
        <div className={`absolute z-20 transition-opacity duration-300 ${
          (selectedLine || selectedCountry) ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ right: (isMobileLandscape || isLargeMobileLandscape) ? 'calc(env(safe-area-inset-right, 0px) + 10%)' : '1.5%', bottom: (isMobileLandscape || isLargeMobileLandscape) ? 'calc(env(safe-area-inset-bottom, 0px) + 28px)' : 'calc(env(safe-area-inset-bottom, 0px) + 40px)' }}
        ref={continentPanelRef}>
            <button
              onClick={() => setShowContinentPanel(!showContinentPanel)}
              // 💡 2. p-3 (상하좌우 패딩)을 삭제하고, 왼쪽 설정 버튼과 똑같이 h-12 w-12 를 추가합니다!
              className="bg-slate-900/95 backdrop-blur-lg rounded-full shadow-2xl border border-white/20 text-white hover:bg-slate-800/95 transition-all flex items-center justify-center h-12 w-12 text-lg"
            >
              ▶️
            </button>


            {showContinentPanel && (
              <div
                className={`absolute ${
                  isMobileLandscape || isLargeMobileLandscape ? 'bottom-14' : 'bottom-16'
                } right-0 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 z-10 ${
                  isMobileLandscape || isLargeMobileLandscape ? '' : 'p-4'
                } ${
                  isMobileLandscape
                    ? 'mobile-landscape-control-panel'
                    : isLargeMobileLandscape
                      ? 'iphone-pro-landscape-control-panel'
                      : ''
                } ${
                  isMobileLandscape || isLargeMobileLandscape
                    ? 'globe-controls-popover-landscape'
                    : ''
                }`}
              >
                <div className={`flex gap-4 ${
                  (isMobileLandscape || isLargeMobileLandscape) 
                    ? 'flex-row mobile-landscape-controls' 
                    : 'flex-col'
                }`}>
                  {/* 빠른 이동 - 대륙별 */}
                  <div>
                    <div className="text-white font-medium text-sm mb-2 flex items-center gap-2 whitespace-nowrap">
                      <span className="text-base">🚀</span>
                      <span>대륙별 이동</span>
                    </div>
                    <div className={`grid grid-cols-3 gap-2 ${
                      isMobileLandscape 
                        ? 'mobile-landscape-continent-grid' 
                        : isLargeMobileLandscape 
                          ? 'iphone-pro-landscape-continent-grid'
                          : ''
                    }`}>
                      {continents.map(({continent, flag, countries, description}) => (
                        <button
                          key={continent}
                          onClick={() => handleContinentClick(continent, countries)}
                          className={`w-[35px] h-[38px] bg-gradient-to-r from-purple-600/50 to-pink-600/30 text-white rounded-lg hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 hover:-translate-y-0.5 border border-purple-500/20 hover:border-purple-400/50 flex items-center justify-center font-bold shadow-lg text-[13px]`}
                          title={description}
                        >
                          {flag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 지구본 조작 */}
                  <div>
                    <div className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                      <span className="text-base">🎮</span>
                      <span>지구본 조작</span>
                    </div>
                    <div className={`flex gap-2 ${
                      isMobileLandscape 
                        ? 'mobile-landscape-globe-controls' 
                        : isLargeMobileLandscape 
                          ? 'iphone-pro-landscape-globe-controls'
                          : ''
                    }`}>
                      <button 
                        onClick={resetView}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-1 py-1.5 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2"
                      >
                        <span className="text-base">🏠</span>
                        <span>홈</span>
                      </button>
                      <button 
                        onClick={toggleRotation}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-1 py-1.5 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2"
                      >
                        <span className="text-base">🔄</span>
                        <span>회전</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )} 
          </div>
      ) : (
        <div className={`absolute bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 z-10 transition-opacity duration-300 ${
          (selectedLine || selectedCountry) ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)', right: '1.5%' }}
        >
          <div className="flex gap-6">
            {/* 빠른 이동 - 대륙별 */}
            <div>
             <div className="text-white font-medium text-sm mb-3 whitespace-nowrap">
                 🚀 대륙별 이동
               </div>

               {/* 버튼 영역은 원래대로 3칸씩 나뉘는 grid 배열을 유지합니다. */}
               <div className="grid grid-cols-3 gap-2">
                 {continents.map(({continent, flag, countries, description}) => (
                   <button
                     key={continent}
                     onClick={() => handleContinentClick(continent, countries)}
                     className="w-[37px] h-[37px] bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white rounded-lg hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 hover:-translate-y-0.5 border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center text-lg font-bold"
                     title={description}
                   >
                     {continent}
                   </button>
                 ))}
               </div>
             </div>
            
            {/* 지구본 조작 */}
            <div>
              <div className="text-white font-medium text-sm mb-3">🎮 지구본 조작</div>
              <div className="flex gap-2">
                <button
                  onClick={resetView}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm flex flex-col items-center justify-center gap-1"
                                                                                              >
                >
                 <span className="text-lg">🏠</span>
                       <span>홈</span>
                </button>
                <button
                  onClick={toggleRotation}
                 className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-1 whitespace-nowrap"
                >
                 <span className="text-lg">🔄</span>
                       <span>회전</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobeControls;
