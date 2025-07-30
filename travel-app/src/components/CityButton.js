import React, { useState } from 'react';

const CityButton = ({ city, cityTrips, onDeleteCityTrip, onEditTrip }) => {
  const [showDates, setShowDates] = useState(false);

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
            <div key={tripIndex} className="flex items-center justify-between text-xs text-slate-300">
              <span>{trip.startDate} ~ {trip.endDate}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onEditTrip(trip)}
                  className="text-blue-400 hover:text-blue-600"
                  title="이 여행 수정"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteCityTrip(city, trip)}
                  className="text-red-400 hover:text-red-600"
                  title="이 여행 삭제"
                >
                  ✖
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityButton;
