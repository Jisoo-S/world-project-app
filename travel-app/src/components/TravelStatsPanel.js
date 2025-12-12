import React, { useState, useRef, useEffect } from 'react';
import { getVisitStyle } from '../data/countryData';

const TravelStatsPanel = ({ 
  showMobileStats, 
  setShowMobileStats, 
  stats, 
  userTravelData, 
  countryData,
  goToCountry,
  setSelectedCountry,
  setSelectedLine,
  setShowAddTravel,
  setShowGlobeControlsOnMobile,
  setShowAllTrips
}) => {
  const [showLegend, setShowLegend] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const isLandscape = window.innerHeight < window.innerWidth;
  const isMobileLandscape = isMobile && isLandscape;
  // 아이폰 프로맥스 등 큰 모바일 기기 감지
  const isLargeMobileLandscape = window.innerWidth > 768 && window.innerWidth <= 1024 && isLandscape && 'ontouchstart' in window;
  const panelRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowMobileStats(false);
      }
    };

    if (showMobileStats) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMobileStats, setShowMobileStats]);

  return (
    <div className={`absolute z-10 right-6 ${
      isMobileLandscape || isLargeMobileLandscape
        ? 'top-0'   // 모바일 가로모드에서 상단바를 덮도록 붙임
        : isMobile
          ? 'top-6' // 모바일 세로
          : 'top-2' // 데스크톱
    }`} ref={panelRef}>
      <div className="flex gap-2">
        {/* 여행지 추가 버튼 */}
        <button
          onClick={() => setShowAddTravel(true)}
          className="bg-emerald-600/90 hover:bg-emerald-700/90 backdrop-blur-lg rounded-xl shadow-2xl px-3 py-3 border border-emerald-500/30 text-white transition-all font-medium text-sm"
          title="여행지 추가"
        >
          ✈️ 여행지 추가
        </button>
        
        {/* 통계 버튼 */}
        <button 
          onClick={() => setShowMobileStats(!showMobileStats)}
          className="bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-2xl px-3 py-3 border border-white/20 text-white hover:bg-slate-800/95 transition-all"
        >
          🌍
        </button>
      </div>
      
      {showMobileStats && (
        <div className={`absolute top-16 right-0 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 ${
          isMobileLandscape 
            ? 'mobile-landscape-stats-fixed overflow-y-auto' 
            : isLargeMobileLandscape 
              ? 'iphone-pro-landscape-stats-fixed overflow-y-auto'
              : 'min-w-72 max-h-[80vh] overflow-y-auto'
        } p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">📊 여행 통계</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAllTrips(true)}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                전체보기
              </button>
              <button 
                onClick={() => setShowLegend(!showLegend)}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                📈
              </button>
            </div>
          </div>
          
          {showLegend && (
            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-white font-medium text-sm mb-2">📈 방문 횟수 범례</div>
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map(visits => {
                  const style = getVisitStyle(visits);
                  return (
                    <div key={visits} className="flex items-center text-xs text-slate-300">
                      <div 
                        className="w-3 h-3 rounded-full mr-2 shadow-sm"
                        style={{ 
                          backgroundColor: style.color,
                          boxShadow: `0 0 6px ${style.glow}`
                        }}
                      ></div>
                      <span>{visits}{visits === 5 ? '+' : ''}회 방문</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">{stats.totalVisits}</div>
              <div className="text-xs text-slate-400">총<br />여행</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{stats.totalCountries}</div>
              <div className="text-xs text-slate-400">방문 <br />국가</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">{stats.totalCities}</div>
              <div className="text-xs text-slate-400">방문 <br />도시</div>
            </div>
          </div>
          

          
          <div className={`space-y-2 overflow-y-auto custom-scrollbar ${
            isMobileLandscape 
              ? 'max-h-32' 
              : isLargeMobileLandscape 
                ? 'max-h-32'
                : 'max-h-48'
          }`}>
            {Object.entries(userTravelData).map(([countryEnglishName, data]) => {
              const style = getVisitStyle(data.visits);
              const displayCountryName = countryData[countryEnglishName] ? `${countryData[countryEnglishName].koreanName} (${countryEnglishName})` : countryEnglishName;
              return (
                <div 
                  key={countryEnglishName}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all border border-slate-700/50 hover:border-slate-600 group"
                >
                  <div 
                    className="flex-grow cursor-pointer"
                    onClick={() => {
                      goToCountry(countryEnglishName);
                      setSelectedCountry({
                        ...userTravelData[countryEnglishName],
                        country: countryEnglishName,
                        displayCountry: displayCountryName,
                        color: style.color
                      }); 
                      setSelectedLine(null);
                      // setShowMobileStats(false); // 이 줄을 제거하여 패널이 닫히지 않도록 함
                      if (isMobile) {
                        setShowGlobeControlsOnMobile(false);
                      }
                    }}
                  >
                    <div className="font-medium text-white text-sm">{displayCountryName}</div>
                    <div className="text-xs text-slate-400">{data.cities.length}개 도시</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: style.color,
                        boxShadow: `0 0 8px ${style.glow}`
                      }}
                    ></div>
                    <span className="text-sm font-bold text-white mr-2">{data.visits}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelStatsPanel;
