import React, { useRef, useEffect } from 'react';

const GlobeControls = ({
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
  const isMobile = window.innerWidth <= 768;
  const isLandscape = window.innerHeight < window.innerWidth;
  const isMobileLandscape = isMobile && isLandscape;
  // 아이폰 프로맥스 등 큰 모바일 기기 감지
  const isLargeMobileLandscape = window.innerWidth > 768 && window.innerWidth <= 950 && isLandscape && 'ontouchstart' in window;
  // 전체 모바일 감지 (작은 모바일 + 큰 모바일)
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
    { continent: 'Oceania', flag: 'AU', countries: [], description: 'AU' }
  ];

  const handleContinentClick = (continent, countries) => {
    const visitedCountries = countries.filter(country => userTravelData[country]);
    if (visitedCountries.length > 0) {
      goToCountry(visitedCountries[0]);
    } else {
      const continentCoords = {
        'Asia': [35, 100],
        'Europe': [50, 10],
        'North America': [45, -100],
        'South America': [-15, -60],
        'Africa': [0, 20],
        'Oceania': [-25, 140]
      };
      if (globeRef.current && continentCoords[continent]) {
        globeRef.current.pointOfView({ 
          lat: continentCoords[continent][0], 
          lng: continentCoords[continent][1], 
          altitude: 2.0 
        }, 1500);
      }
    }
    // 모든 모바일 환경(세로, 가로 포함)에서 패널 닫기
    if (isAnyMobile) {
      setShowContinentPanel(false);
    }
  };

  return (
    <>
      {/* 지구본 모드 선택 및 줌 컨트롤 */}
      <div className={`absolute z-10 ${
        isMobile 
          ? isLandscape 
            ? 'top-6 left-32'  // 가로모드일 때 더 오른쪽으로 이동 (left-20 -> left-32)
            : 'top-14 left-3'  // 세로모드일 때만 더 위로 올림
          : 'top-6 left-6'    // 데스크톱은 그대로
      }`}>
        {/* 지구본 모드 선택 */}
        <div className={`bg-slate-900/95 backdrop-blur-lg shadow-2xl border border-white/20 ${
          isMobile 
            ? isMobileLandscape 
              ? 'rounded-xl p-2.5 w-24 mobile-landscape-mode-box' 
              : 'rounded-xl p-2.5 w-24'
            : isLargeMobileLandscape
              ? 'rounded-xl p-2.5 w-24 iphone-pro-landscape-mode-box'
              : 'rounded-2xl p-4 w-40'
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
          <div className={`flex flex-row gap-1 items-center justify-center ${
            isAnyMobile ? 'mt-2' : 'mt-3'
          }`}>
            <button
              onClick={() => {
                if (globeRef.current) {
                  const currentPov = globeRef.current.pointOfView();
                  const currentAltitude = currentPov.altitude || zoomLevel;
                  const newZoom = Math.max(1.2, currentAltitude - 0.3);
                  setZoomLevel(newZoom);
                  globeRef.current.pointOfView({ 
                    lat: currentPov.lat, 
                    lng: currentPov.lng, 
                    altitude: newZoom 
                  }, 300);
                }
              }}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center ${
                isAnyMobile ? 'h-6 text-xs' : 'h-8 text-sm'
              }`}
            >
              +
            </button>
            <button
              onClick={() => {
                if (globeRef.current) {
                  const currentPov = globeRef.current.pointOfView();
                  const currentAltitude = currentPov.altitude || zoomLevel;
                  const newZoom = Math.min(8.0, currentAltitude + 0.3);
                  setZoomLevel(newZoom);
                  globeRef.current.pointOfView({ 
                    lat: currentPov.lat, 
                    lng: currentPov.lng, 
                    altitude: newZoom 
                  }, 300);
                }
              }}
              className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center ${
                isAnyMobile ? 'h-6 text-xs' : 'h-8 text-sm'
              }`}
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      {isAnyMobile ? (
        (selectedLine || selectedCountry) ? null : (
          <div className="absolute bottom-6 right-6 z-10" ref={continentPanelRef}>
            <button
              onClick={() => setShowContinentPanel(!showContinentPanel)}
              className="bg-slate-900/95 backdrop-blur-lg rounded-full shadow-2xl p-3 border border-white/20 text-white hover:bg-slate-800/95 transition-all"
            >
              ▶️
            </button>
            {showContinentPanel && (
              <div className={`absolute bottom-16 right-0 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 z-10 p-4 ${
                isMobileLandscape 
                  ? 'mobile-landscape-control-panel' 
                  : isLargeMobileLandscape 
                    ? 'iphone-pro-landscape-control-panel'
                    : ''
              }`}>
                <div className={`flex gap-4 ${
                  (isMobileLandscape || isLargeMobileLandscape) 
                    ? 'flex-row mobile-landscape-controls' 
                    : 'flex-col'
                }`}>
                  {/* 빠른 이동 - 대륙별 */}
                  <div>
                    <div className="text-white font-medium text-sm mb-2 flex items-center gap-2">
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
                          className={`aspect-square bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white rounded-xl hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 hover:-translate-y-0.5 border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center font-bold shadow-lg ${
                            (isMobileLandscape || isLargeMobileLandscape) ? 'text-xl' : 'text-xl'
                          }`}
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
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2"
                      >
                        <span className="text-base">🏠</span>
                        <span>홈</span>
                      </button>
                      <button 
                        onClick={toggleRotation}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2"
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
        )
      ) : (
        <div className="absolute bottom-6 right-6 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 z-10">
          <div className="flex gap-6">
            {/* 빠른 이동 - 대륙별 */}
            <div>
              <div className="text-white font-medium text-sm mb-3">🚀 대륙별 이동</div>
              <div className="grid grid-cols-3 gap-2">
                {continents.map(({continent, flag, countries, description}) => (
                  <button
                    key={continent}
                    onClick={() => handleContinentClick(continent, countries)}
                    className="w-[37px] h-[37px] bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white rounded-lg hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 hover:-translate-y-0.5 border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center text-lg font-bold"
                    title={description}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 지구본 조작 */}
            <div>
              <div className="text-white font-medium text-sm mb-3">🎮 지구본 조작</div>
              <div className="space-y-2">
                <button 
                  onClick={resetView}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm"
                >
                  🏠 홈
                </button>
                <button 
                  onClick={toggleRotation}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm"
                >
                  🔄 회전
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