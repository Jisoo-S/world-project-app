import React, { useState, useRef } from 'react';
import UltraRealisticGlobe from './UltraRealisticGlobe_old';
import { countryData } from './data/countryData';

function App() {
  const globeRef = useRef();
  const [travelData, setTravelData] = useState({
    '일본': {
      visits: 2,
      trips: [
        { location: '도쿄', dates: '2023.03.15 - 03.20' },
        { location: '오사카', dates: '2023.09.10 - 09.15' }
      ],
      cities: ['도쿄', '오사카'],
      lastVisit: '2023.09.15'
    },
    '미국': {
      visits: 1,
      trips: [
        { location: '뉴욕', dates: '2023.06.01 - 06.10' }
      ],
      cities: ['뉴욕'],
      lastVisit: '2023.06.10'
    }
  });

  const handleCountryClick = (countryData) => {
    console.log('국가 클릭:', countryData);
  };

  const handleLineClick = (lineData) => {
    console.log('라인 클릭:', lineData);
  };

  const handleUpdateTrip = (country, tripIndex, newTripData) => {
    setTravelData(prevData => {
      const newData = { ...prevData };
      const newTrips = [...newData[country].trips];
      newTrips[tripIndex] = newTripData;
      newData[country] = { ...newData[country], trips: newTrips };
      return newData;
    });
  };

  const handleDeleteTrip = (country, tripIndex) => {
    setTravelData(prevData => {
      const newData = { ...prevData };
      const newTrips = [...newData[country].trips];
      newTrips.splice(tripIndex, 1);
      newData[country] = { ...newData[country], trips: newTrips, visits: newTrips.length };
      if (newTrips.length === 0) {
        delete newData[country];
      }
      return newData;
    });
  };

  const handleAddTrip = (country, newTripData) => {
    setTravelData(prevData => {
      const newData = { ...prevData };
      const countryKey = Object.keys(countryData).find(k => countryData[k].koreanName === country);

      if (!countryKey) return newData; // Country not found

      if (newData[country]) {
        const newTrips = [...newData[country].trips, newTripData];
        newData[country] = { ...newData[country], trips: newTrips, visits: newTrips.length };
      } else {
        newData[country] = {
          visits: 1,
          trips: [newTripData],
          cities: [newTripData.location],
          lastVisit: newTripData.dates.split(' - ')[1],
          coordinates: countryData[countryKey].coords,
          description: '아름다운 여행지'
        };
      }
      return newData;
    });
  };

  return (
    <div className="App">
      <UltraRealisticGlobe 
        ref={globeRef}
        travelData={travelData} 
        onUpdateTrip={handleUpdateTrip} 
        onDeleteTrip={handleDeleteTrip} 
        onAddTrip={handleAddTrip}
      />
    </div>
  );
}

export default App;
