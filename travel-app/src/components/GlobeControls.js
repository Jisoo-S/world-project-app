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
  setShowContinentPanel
}) => {
  const isMobile = window.innerWidth <= 768;
  const continentPanelRef = useRef(null);

  // 외부 클릭 감지 (모바일 대륙 패널)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (continentPanelRef.current && !continentPanelRef.current.contains(event.target)) {
        setShowContinentPanel(false);
      }
    };

    if (showContinentPanel && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showContinentPanel, setShowContinentPanel, isMobile]);

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
    if (isMobile) {
      setShowContinentPanel(false);
    }
  };

  return (
    <>
      {/* 지구본 모드 선택 및 줌 컨트롤 */}
      <div className={`absolute top-6 ${isMobile ? 'left-1' : 'left-6'} flex gap-3 z-10`}>
        {/* 지구본 모드 선택 */}
        <div className={`bg-slate-900/95 backdrop-blur-lg shadow-2xl border border-white/20 ${
          isMobile 
            ? 'rounded-xl p-2 w-24 h-32' 
            : 'rounded-2xl p-4 w-40 h-40'
        }`}>
          <div className={`text-white font-medium mb-2 ${
            isMobile ? 'text-xs' : 'text-sm font-bold mb-3'
          }`}>🛰️ 모드</div>
          <div className={isMobile ? 'space-y-1' : 'space-y-1.5'}>
            <button
              onClick={() => changeGlobeMode('satellite')}
              className={`w-full font-medium transition-all ${
                isMobile 
                  ? 'px-1 py-0.5 rounded-md text-xs' 
                  : 'px-3 py-1.5 rounded-lg text-xs'
              } ${
                globeMode === 'satellite' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              위성 🛰️
            </button>
            <button
              onClick={() => changeGlobeMode('night')}
              className={`w-full font-medium transition-all ${
                isMobile 
                  ? 'px-1 py-0.5 rounded-md text-xs' 
                  : 'px-3 py-1.5 rounded-lg text-xs'
              } ${
                globeMode === 'night' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              야간 🌙
            </button>
            <button
              onClick={() => changeGlobeMode('topographic')}
              className={`w-full font-medium transition-all ${
                isMobile 
                  ? 'px-1 py-0.5 rounded-md text-xs' 
                  : 'px-3 py-1.5 rounded-lg text-xs'
              } ${
                globeMode === 'topographic' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              지형 🗺️
            </button>
          </div>
        </div>
        
        {/* 줌 컨트롤 버튼 */}
        <div className="bg-slate-900/95 backdrop-blur-lg shadow-2xl border border-white/20 rounded-xl p-1 flex flex-row gap-1 items-center self-start">
          <button
            onClick={() => {
              const newZoom = Math.max(1.2, zoomLevel - 0.3);
              setZoomLevel(newZoom);
              if (globeRef.current) {
                const currentPov = globeRef.current.pointOfView();
                globeRef.current.pointOfView({ 
                  lat: currentPov.lat, 
                  lng: currentPov.lng, 
                  altitude: newZoom 
                }, 300);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg transition-all text-sm w-10 h-10 flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => {
              const newZoom = Math.min(4.0, zoomLevel + 0.3);
              setZoomLevel(newZoom);
              if (globeRef.current) {
                const currentPov = globeRef.current.pointOfView();
                globeRef.current.pointOfView({ 
                  lat: currentPov.lat, 
                  lng: currentPov.lng, 
                  altitude: newZoom 
                }, 300);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg transition-all text-sm w-10 h-10 flex items-center justify-center"
          >
            -
          </button>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      {isMobile ? (
        <div className="absolute bottom-6 right-6 z-10" ref={continentPanelRef}>
          <button
            onClick={() => setShowContinentPanel(!showContinentPanel)}
            className="bg-slate-900/95 backdrop-blur-lg rounded-full shadow-2xl p-3 border border-white/20 text-white hover:bg-slate-800/95 transition-all"
          >
            ▶️
          </button>
          {showContinentPanel && (
            <div className="absolute bottom-16 right-0 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 z-10 p-4">
              <div className="flex flex-col gap-4">
                {/* 빠른 이동 - 대륙별 */}
                <div>
                  <div className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                    <span className="text-base">🚀</span>
                    <span>대륙별 이동</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {continents.map(({continent, flag, countries, description}) => (
                      <button
                        key={continent}
                        onClick={() => handleContinentClick(continent, countries)}
                        className="aspect-square bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white rounded-xl hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 hover:-translate-y-0.5 border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center text-xl font-bold shadow-lg"
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
                  <div className="flex gap-2">
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
                    className="aspect-square bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white rounded-lg hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 hover:-translate-y-0.5 border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center text-lg font-bold"
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
