import React from 'react';
import { countryData } from '../data/countryData';

const LineInfoPanel = ({ 
  selectedLine, 
  setSelectedLine, 
  selectedLineIndex, 
  setSelectedLineIndex, 
  lineInfoRef 
}) => {
  if (!selectedLine || !selectedLine.trips || selectedLine.trips.length === 0) return null;

  const currentTrip = selectedLine.trips[selectedLineIndex] || selectedLine.trips[0];
  const hasMultipleTrips = selectedLine.trips.length > 1;

  const handlePrevTrip = () => {
    if (selectedLineIndex < selectedLine.trips.length - 1) {
      setSelectedLineIndex(selectedLineIndex + 1);
    }
  };

  const handleNextTrip = () => {
    if (selectedLineIndex > 0) {
      setSelectedLineIndex(selectedLineIndex - 1);
    }
  };

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
            disabled={selectedLineIndex >= selectedLine.trips.length - 1}
            className={`text-white text-xl transition-colors ${
              selectedLineIndex >= selectedLine.trips.length - 1 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:text-blue-400'
            }`}
          >
            ←
          </button>
        )}
        
        <div>
          <div className="text-white font-bold text-md mb-1">
            {countryData[selectedLine.startCountry]?.koreanName || selectedLine.startCountry} → {countryData[selectedLine.endCountry]?.koreanName || selectedLine.endCountry}
          </div>
          <div className="text-slate-400 text-sm">
            {currentTrip.startDate} ~ {currentTrip.endDate}
          </div>
          {hasMultipleTrips && (
            <div className="text-slate-500 text-xs mt-1">
              {selectedLineIndex + 1} / {selectedLine.trips.length} 여행
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
