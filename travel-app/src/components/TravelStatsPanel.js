import React, { useState, useRef, useEffect } from 'react';
import { getVisitStyle } from '../data/countryData';

const TravelStatsPanel = ({ 
  isMobile,
  isLandscape,
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
  const isMobileLandscape = isMobile && isLandscape;
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
    <div
      className={`absolute ${
        isMobile && !isLandscape ? 'z-30' :
        isMobile && isLandscape ? 'z-40' :
        'z-30'
      }`}
      style={{
        right: isMobile && isLandscape ? 'calc(env(safe-area-inset-right, 0px) + 10%)' : '1.5%',
        top: isMobile && !isLandscape ? 'calc(env(safe-area-inset-top, 0px) + 8px)' :
             isMobile && isLandscape ? '2%' :
             '2%'
      }}
      ref={panelRef}
    >
      <div className="flex gap-2 relative items-center"> {/* items-center 추가 */}
  {/* 여행지 추가 버튼 */}
  <button
    onClick={() => setShowAddTravel(true)}
    className="bg-emerald-600/90 hover:bg-emerald-700/90 backdrop-blur-lg rounded-xl shadow-2xl px-3 border border-emerald-500/30 text-white transition-all font-medium text-sm flex items-center justify-center h-[46px]" 
    title="여행지 추가"
  >
    ✈️ 여행지 추가
  </button>
  
  {/* 통계 버튼 */}
  <button 
    onClick={() => setShowMobileStats(!showMobileStats)}
    className="bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-2xl px-3 border border-white/20 text-white hover:bg-slate-800/95 transition-all flex items-center justify-center h-[46px] w-[46px]"
  >
    🌍
  </button>
</div>
      
      {showMobileStats && (
        <div className={`absolute ${isMobileLandscape ? 'top-14' : 'top-16'} right-0 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 ${
          isMobileLandscape 
            ? 'mobile-landscape-stats-fixed' 
            : 'min-w-72 max-h-[80vh] overflow-y-auto'
        } p-6`}
        style={isMobileLandscape ? { maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', padding: '12px' } : {}}
        >
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
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
          
          <div className={`grid grid-cols-3 mb-3 flex-shrink-0 ${isMobileLandscape ? 'gap-2' : 'gap-4'}`}>
            <div className={`text-center bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl border border-green-500/30 ${isMobileLandscape ? 'p-2' : 'p-3'}`}>
              <div className={`font-bold text-green-400 ${isMobileLandscape ? 'text-xl' : 'text-2xl'}`}>{stats.totalVisits}</div>
              <div className="text-xs text-slate-400">총<br />여행</div>
            </div>
            <div className={`text-center bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl border border-blue-500/30 ${isMobileLandscape ? 'p-2' : 'p-3'}`}>
              <div className={`font-bold text-blue-400 ${isMobileLandscape ? 'text-xl' : 'text-2xl'}`}>{stats.totalCountries}</div>
              <div className="text-xs text-slate-400">방문 <br />국가</div>
            </div>
            <div className={`text-center bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl border border-purple-500/30 ${isMobileLandscape ? 'p-2' : 'p-3'}`}>
              <div className={`font-bold text-purple-400 ${isMobileLandscape ? 'text-xl' : 'text-2xl'}`}>{stats.totalCities}</div>
              <div className="text-xs text-slate-400">방문 <br />도시</div>
            </div>
          </div>
          

          
          <div className={`space-y-2 ${
            isLandscape ? '' : 'overflow-y-auto custom-scrollbar max-h-60'
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
