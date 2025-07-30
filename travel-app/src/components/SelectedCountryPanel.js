import React, { useRef, useEffect } from 'react';
import CityButton from './CityButton';

const SelectedCountryPanel = ({ 
  selectedCountry, 
  setSelectedCountry, 
  setShowGlobeControlsOnMobile,
  deleteCityTrip,
  setEditingTrip
}) => {
  const isMobile = window.innerWidth <= 768;
  const panelRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setSelectedCountry(null);
        if (isMobile) {
          setShowGlobeControlsOnMobile(true);
        }
      }
    };

    if (selectedCountry) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedCountry, setSelectedCountry, setShowGlobeControlsOnMobile, isMobile]);

  if (!selectedCountry) return null;

  return (
    <div 
      ref={panelRef}
      className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 z-10 ${
        isMobile ? 'w-[calc(100%-2rem)]' : 'min-w-96 max-w-lg'
      }`}
    >
      <button 
        onClick={() => {
          setSelectedCountry(null);
          if (isMobile) {
            setShowGlobeControlsOnMobile(true);
          }
        }}
        className="absolute top-4 right-4 text-slate-400 hover:text-red-400 text-2xl transition-colors"
      >
        ×
      </button>
      <h3 className="text-white font-bold text-xl mb-4 border-b border-slate-700 pb-2">
        🌍 {selectedCountry.displayCountry}
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">방문 횟수</div>
            <div className="text-xl font-bold" style={{ color: selectedCountry.color }}>
              {selectedCountry.visits}회
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">마지막 방문</div>
            <div className="text-lg font-semibold text-white">{selectedCountry.lastVisit}</div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-sm mb-2">방문 도시 (클릭하면 여행 기간 표시)</div>
          <div className="space-y-2">
            {selectedCountry.cities.map((city, index) => {
              const cityTrips = (selectedCountry.trips || []).filter(trip => trip.cities.includes(city));
              return (
                <CityButton 
                  key={index} 
                  city={city} 
                  cityTrips={cityTrips} 
                  onDeleteCityTrip={deleteCityTrip}
                  onEditTrip={(trip) => setEditingTrip({ 
                    ...trip, 
                    originalStartDate: trip.startDate, 
                    originalEndDate: trip.endDate, 
                    originalCities: trip.cities 
                  })}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedCountryPanel;
