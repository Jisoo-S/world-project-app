import React from 'react';
import { countryData } from '../data/countryData';

const LineInfoPanel = ({ 
  selectedLine, 
  setSelectedLine, 
  selectedLineIndex, 
  setSelectedLineIndex, 
  lineInfoRef,
  homeCountry
}) => {
  if (!selectedLine || !selectedLine.trips || selectedLine.trips.length === 0) return null;

  // 최근 여행이 먼저 오도록 정렬 (날짜 기준 내림차순)
  const sortedTrips = [...selectedLine.trips].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  );

  const currentTrip = sortedTrips[selectedLineIndex] || sortedTrips[0];
  const hasMultipleTrips = sortedTrips.length > 1;

  const handlePrevTrip = () => {
    if (selectedLineIndex < sortedTrips.length - 1) {
      setSelectedLineIndex(selectedLineIndex + 1);
    }
  };

  const handleNextTrip = () => {
    if (selectedLineIndex > 0) {
      setSelectedLineIndex(selectedLineIndex - 1);
    }
  };

  // 국가 표시 순서 결정
  let displayStartCountry = selectedLine.startCountry;
  let displayEndCountry = selectedLine.endCountry;
  
  const defaultHomeCountry = homeCountry || 'South Korea';
  
  // 홈국가가 포함되지 않은 경우에만 한글 이름 기준 정렬
  const isHomeConnection = displayStartCountry === defaultHomeCountry || displayEndCountry === defaultHomeCountry;
  
  if (!isHomeConnection) {
    // 여행 국가끼리 연결된 경우, 한글 이름 기준 ㄱㄴㄷ 순 정렬
    const startKoreanName = countryData[displayStartCountry]?.koreanName || displayStartCountry;
    const endKoreanName = countryData[displayEndCountry]?.koreanName || displayEndCountry;
    
    if (startKoreanName > endKoreanName) {
      [displayStartCountry, displayEndCountry] = [displayEndCountry, displayStartCountry];
    }
  }

  return (
    <div 
      ref={lineInfoRef}
      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 z-10 text-center min-w-[300px]"
    >
      <button 
        onClick={() => {
          setSelectedLine(null);
          setSelectedLineIndex(0);
        }}
        className="absolute top-2 right-2 text-slate-400 hover:text-red-400 text-xl transition-colors"
      >
        ×
      </button>
      
      <div className="flex items-center justify-center gap-4">
        {hasMultipleTrips && (
          <button
            onClick={handlePrevTrip}
            disabled={selectedLineIndex >= sortedTrips.length - 1}
            className={`text-white text-xl transition-colors ${
              selectedLineIndex >= sortedTrips.length - 1 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:text-blue-400'
            }`}
          >
            ←
          </button>
        )}
        
        <div>
          <div className="text-white font-bold text-md mb-1">
            {countryData[displayStartCountry]?.koreanName || displayStartCountry} - {countryData[displayEndCountry]?.koreanName || displayEndCountry}
          </div>
          <div className="text-slate-400 text-sm">
            {currentTrip.startDate} ~ {currentTrip.endDate}
          </div>
          {hasMultipleTrips && (
            <div className="text-slate-500 text-xs mt-1">
              {selectedLineIndex + 1} / {sortedTrips.length} 여행
            </div>
          )}
        </div>
        
        {hasMultipleTrips && (
          <button
            onClick={handleNextTrip}
            disabled={selectedLineIndex <= 0}
            className={`text-white text-xl transition-colors ${
              selectedLineIndex <= 0 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:text-blue-400'
            }`}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
};

export default LineInfoPanel;
