import React, { useState } from 'react';

const CityButton = ({ city, cityTrips, onDeleteCityTrip, onEditTrip, country }) => {
  const [showDates, setShowDates] = useState(false);

  // Helper function to calculate days between two dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
    return diffDays;
  };

  // 여행 기간을 시작일 기준으로 오름차순 정렬
  const sortedCityTrips = [...cityTrips].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowDates(!showDates)}
          className="px-3 py-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white rounded-full text-sm font-medium border border-blue-500/30 hover:from-blue-600/50 hover:to-purple-600/50 transition-all cursor-pointer"
        >
          {city} {cityTrips.length > 0 && `(${cityTrips.length})`}
        </button>
      </div>
      {showDates && sortedCityTrips.length > 0 && (
        <div className="ml-4 mt-2 space-y-1">
          {sortedCityTrips.map((trip, tripIndex) => (
            <div key={tripIndex} className="flex flex-col items-start justify-between text-xs text-slate-300">
              <div className="flex items-center justify-between w-full">
                <span className="flex-grow">{trip.startDate} ~ {trip.endDate} ({calculateDays(trip.startDate, trip.endDate)}일)</span>
                <div className="flex gap-1 items-center"> {/* Added items-center for vertical alignment */}
                  <button
                    onClick={() => onEditTrip(trip, country)}
                    className="text-blue-400 hover:text-blue-600 h-6 w-6 flex items-center justify-center" // Added h-6 w-6 flex items-center justify-center for consistent button size and alignment
                    title="이 여행 수정"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDeleteCityTrip({ ...trip, country: country })}
                    className="text-red-400 hover:text-red-600 h-6 w-6 flex items-center justify-center" // Added h-6 w-6 flex items-center justify-center
                    title="이 여행 삭제"
                  >
                    ✖
                  </button>
                </div>
              </div>
              <div className="w-full text-right mt-1"> {/* Added w-full text-right mt-1 for #1 placement */}
                #{tripIndex + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityButton;
