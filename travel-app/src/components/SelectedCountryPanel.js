import React, { useRef, useEffect } from 'react';
import CityButton from './CityButton';

const SelectedCountryPanel = ({ 
  selectedCountry, 
  setSelectedCountry, 
  setShowGlobeControlsOnMobile,
  deleteCityTrip,
  setEditingTrip,
  editingTrip  // editingTrip prop 추가
}) => {
  const isMobile = window.innerWidth <= 768;
  const isLandscape = window.innerHeight < window.innerWidth;
  const isMobileLandscape = isMobile && isLandscape;
  const panelRef = useRef(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 수정 중일 때는 패널이 닫히지 않도록 함
      if (editingTrip) return;
      
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
  }, [selectedCountry, setSelectedCountry, setShowGlobeControlsOnMobile, isMobile, editingTrip]);

  if (!selectedCountry) return null;

  return (
    <div 
      ref={panelRef}
      className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 z-10 ${
        isMobile ? 'w-[calc(100%-2rem)]' : 'min-w-96 max-w-lg'
      } ${
        isMobileLandscape ? 'mobile-landscape-country-fixed' : ''
      }`}
    >
      <button 
        onClick={() => {
          // 수정 중일 때는 X 버튼도 작동하지 않도록 함
          if (editingTrip) return;
          
          setSelectedCountry(null);
          if (isMobile) {
            setShowGlobeControlsOnMobile(true);
          }
        }}
        className={`absolute top-4 right-4 text-2xl transition-colors ${
          editingTrip 
            ? 'text-slate-600 cursor-not-allowed' 
            : 'text-slate-400 hover:text-red-400 cursor-pointer'
        }`}
        disabled={editingTrip}
      >
        ×
      </button>
      <h3 className="text-white font-bold text-xl mb-4 border-b border-slate-700 pb-2 flex-shrink-0">
        🌍 {selectedCountry.displayCountry}
      </h3>
      <div className={`space-y-4 ${
        isMobileLandscape ? 'flex-1 overflow-y-auto' : ''
      }`}>
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
        
        <div className={`bg-slate-800/50 rounded-lg border border-slate-700 ${
          isMobileLandscape ? 'flex-shrink-0' : ''
        } p-4`}>
          <div className="text-slate-400 text-sm mb-2">방문 도시 (클릭하면 여행 기간 표시)</div>
          <div className={`overflow-y-auto custom-scrollbar-right space-y-2 ${
            isMobileLandscape ? 'mobile-landscape-cities' : 'max-h-48'
          }`}>
            {selectedCountry.cities.map((city, index) => {
              const cityTrips = (selectedCountry.trips || []).filter(trip => trip.cities.includes(city));
              return (
                <CityButton 
                  key={index} 
                  city={city} 
                  cityTrips={cityTrips} 
                  onDeleteCityTrip={deleteCityTrip}
                  country={selectedCountry.country}
                  onEditTrip={(trip, country) => setEditingTrip({ 
                    ...trip, 
                    originalStartDate: trip.startDate, 
                    originalEndDate: trip.endDate, 
                    originalCities: trip.cities,
                    country: country
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
