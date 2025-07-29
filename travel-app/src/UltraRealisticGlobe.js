import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

// 도시 버튼 컴포넌트
const CityButton = ({ city, cityTrips, onDeleteCityTrip }) => {
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
              <button
                onClick={() => onDeleteCityTrip(city, trip)}
                className="text-red-400 hover:text-red-600 ml-2"
                title="이 여행 삭제"
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UltraRealisticGlobe = () => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('로딩 중...'); // Simplified initial status
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [globeMode, setGlobeMode] = useState('satellite');
  const [zoomLevel, setZoomLevel] = useState(2.5);
  
  const [userTravelData, setUserTravelData] = useState({});
  const [showAddTravel, setShowAddTravel] = useState(false);
  const [newTravelData, setNewTravelData] = useState({
    country: '', // This will now store the English name, but display Korean in UI
    cities: '',
    startDate: '',
    endDate: ''
  });
  const [showDateErrorModal, setShowDateErrorModal] = useState(false);
  const [showGlobeControlsOnMobile, setShowGlobeControlsOnMobile] = useState(true); // New state for mobile controls

  // 국가 좌표 및 한글 이름 데이터
  const countryData = {
    'South Korea': { coords: [37.5665, 126.9780], koreanName: '대한민국' },
    'Japan': { coords: [36.2048, 138.2529], koreanName: '일본' },
    'United States': { coords: [39.8283, -98.5795], koreanName: '미국' },
    'France': { coords: [46.6034, 2.2137], koreanName: '프랑스' },
    'Italy': { coords: [41.8719, 12.5674], koreanName: '이탈리아' },
    'Germany': { coords: [51.1657, 10.4515], koreanName: '독일' },
    'United Kingdom': { coords: [55.3781, -3.4360], koreanName: '영국' },
    'Spain': { coords: [40.4637, -3.7492], koreanName: '스페인' },
    'Canada': { coords: [56.1304, -106.3468], koreanName: '캐나다' },
    'Australia': { coords: [-25.2744, 133.7751], koreanName: '호주' },
    'China': { coords: [35.8617, 104.1954], koreanName: '중국' },
    'India': { coords: [20.5937, 78.9629], koreanName: '인도' },
    'Brazil': { coords: [-14.2350, -51.9253], koreanName: '브라질' },
    'Mexico': { coords: [23.6345, -102.5528], koreanName: '멕시코' },
    'Russia': { coords: [61.5240, 105.3188], koreanName: '러시아' },
    'South Africa': { coords: [-30.5595, 22.9375], koreanName: '남아프리카' },
    'Egypt': { coords: [26.8206, 30.8025], koreanName: '이집트' },
    'Turkey': { coords: [38.9637, 35.2433], koreanName: '튀르키예' },
    'Greece': { coords: [39.0742, 21.8243], koreanName: '그리스' },
    'Thailand': { coords: [15.8700, 100.9925], koreanName: '태국' },
    'Vietnam': { coords: [14.0583, 108.2772], koreanName: '베트남' },
    'Singapore': { coords: [1.3521, 103.8198], koreanName: '싱가포르' },
    'Indonesia': { coords: [-0.7893, 113.9213], koreanName: '인도네시아' },
    'Philippines': { coords: [12.8797, 121.7740], koreanName: '필리핀' },
    'New Zealand': { coords: [-40.9006, 174.8860], koreanName: '뉴질랜드' },
    'Argentina': { coords: [-38.4161, -63.6167], koreanName: '아르헨티나' },
    'Chile': { coords: [-35.6751, -71.5430], koreanName: '칠레' },
    'Peru': { coords: [-9.1900, -75.0152], koreanName: '페루' },
    'Morocco': { coords: [31.7917, -7.0926], koreanName: '모로코' },
    'Kenya': { coords: [-0.0236, 37.9062], koreanName: '케냐' },
    'Netherlands': { coords: [52.1326, 5.2913], koreanName: '네덜란드' },
    'Belgium': { coords: [50.5039, 4.4699], koreanName: '벨기에' },
    'Switzerland': { coords: [46.8182, 8.2275], koreanName: '스위스' },
    'Austria': { coords: [47.5162, 14.5501], koreanName: '오스트리아' },
    'Sweden': { coords: [60.1282, 18.6435], koreanName: '스웨덴' },
    'Norway': { coords: [60.4720, 8.4689], koreanName: '노르웨이' },
    'Denmark': { coords: [56.2639, 9.5018], koreanName: '덴마크' },
    'Finland': { coords: [61.9241, 25.7482], koreanName: '핀란드' },
    'Poland': { coords: [51.9194, 19.1451], koreanName: '폴란드' },
    'Czech Republic': { coords: [49.8175, 15.4730], koreanName: '체코' },
    'Portugal': { coords: [39.3999, -8.2245], koreanName: '포르투갈' },
    'Ireland': { coords: [53.4129, -8.2439], koreanName: '아일랜드' },
    'Scotland': { coords: [56.4907, -4.2026], koreanName: '스코틀랜드' },
    'Iceland': { coords: [64.9631, -19.0208], koreanName: '아이슬란드' },
    'Croatia': { coords: [45.1000, 15.2000], koreanName: '크로아티아' },
    'Hungary': { coords: [47.1625, 19.5033], koreanName: '헝가리' },
    'Romania': { coords: [45.9432, 24.9668], koreanName: '루마니아' },
    'Bulgaria': { coords: [42.7339, 25.4858], koreanName: '불가리아' },
    'Ukraine': { coords: [48.3794, 31.1656], koreanName: '우크라이나' },
    'Israel': { coords: [31.0461, 34.8516], koreanName: '이스라엘' },
    'UAE': { coords: [23.4241, 53.8478], koreanName: 'UAE' },
    'Saudi Arabia': { coords: [23.8859, 45.0792], koreanName: '사우디아라비아' },
    'Malaysia': { coords: [4.2105, 101.9758], koreanName: '말레이시아' },
    'Taiwan': { coords: [23.6978, 120.9605], koreanName: '대만' },
    'Hong Kong': { coords: [22.3193, 114.1694], koreanName: '홍콩' },
    'Nepal': { coords: [28.3949, 84.1240], koreanName: '네팔' },
    'Sri Lanka': { coords: [7.8731, 80.7718], koreanName: '스리랑카' },
    'Pakistan': { coords: [30.3753, 69.3451], koreanName: '파키스탄' },
    'Bangladesh': { coords: [23.6850, 90.3563], koreanName: '방글라데시' },
    'Myanmar': { coords: [21.9162, 95.9560], koreanName: '미얀마' },
    'Cambodia': { coords: [12.5657, 104.9910], koreanName: '캄보디아' },
    'Laos': { coords: [19.8563, 102.4955], koreanName: '라오스' }
  };

  // 방문 횟수에 따른 색상과 크기
  const getVisitStyle = (visits) => {
    const styles = {
      1: { color: '#10b981', size: 0.3, glow: '#10b98180' },
      2: { color: '#f59e0b', size: 0.4, glow: '#f59e0b80' },
      3: { color: '#3b82f6', size: 0.5, glow: '#3b82f680' },
      4: { color: '#8b5cf6', size: 0.6, glow: '#8b5cf680' },
      5: { color: '#ef4444', size: 0.7, glow: '#ef444480' }
    };
    return styles[Math.min(visits, 5)] || styles[5];
  };

  // 사용자 여행 포인트 생성
  const createTravelPoints = () => {
    return Object.entries(userTravelData).map(([countryEnglishName, data]) => {
      const style = getVisitStyle(data.visits);
      const displayCountryName = countryData[countryEnglishName] ? `${countryData[countryEnglishName].koreanName} (${countryEnglishName})` : countryEnglishName;
      return {
        lat: data.coordinates[0],
        lng: data.coordinates[1],
        country: countryEnglishName, // Store English name
        displayCountry: displayCountryName, // For display
        visits: data.visits,
        lastVisit: data.lastVisit,
        cities: data.cities,
        description: data.description,
        size: style.size,
        color: style.color,
        glowColor: style.glow,
        trips: data.trips // Ensure trips data is passed to the point for details
      };
    });
  };

  // 여행 경로 생성 (날짜 순서대로 연결)
  const createTravelRoutes = () => {
    const allTripsFlat = [];
    Object.entries(userTravelData).forEach(([countryEnglishName, data]) => {
      data.trips.forEach(trip => {
        allTripsFlat.push({
          country: countryEnglishName,
          coords: data.coordinates,
          startDate: trip.startDate,
          endDate: trip.endDate
        });
      });
    });

    // 날짜 순서대로 정렬
    allTripsFlat.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    const routes = [];
    const koreaCoords = countryData['South Korea']?.coords;

    if (!koreaCoords) {
      console.error("South Korea coordinates not found in countryData.");
      return routes;
    }

    let previousCoords = koreaCoords;
    let previousEndDate = null; // To check for breaks in continuous travel

    allTripsFlat.forEach((currentTrip) => {
      const currentTripStartDate = new Date(currentTrip.startDate);
      const previousTripEndDate = previousEndDate ? new Date(previousEndDate) : null;

      let startPointCoords;

      // Check for a break in continuous travel (e.g., more than 1 day gap)
      if (previousTripEndDate && (currentTripStartDate - previousTripEndDate) / (1000 * 60 * 60 * 24) > 1) {
        // If there's a significant gap, start from Korea again
        startPointCoords = koreaCoords;
      } else {
        // Otherwise, continue from the previous country
        startPointCoords = previousCoords;
      }

      // Only draw an arc if the start and end points are different
      // and ensure we are not trying to connect a country to itself directly
      if (startPointCoords[0] !== currentTrip.coords[0] || startPointCoords[1] !== currentTrip.coords[1]) {
        routes.push({
          startLat: startPointCoords[0],
          startLng: startPointCoords[1],
          endLat: currentTrip.coords[0],
          endLng: currentTrip.coords[1],
          // All lines are the same color and solid as per new request
          color: '#60a5fa', // A consistent blue color
          stroke: 2
        });
      }
      
      previousCoords = currentTrip.coords;
      previousEndDate = currentTrip.endDate;
    });

    return routes;
  };

  // 여행지 추가 함수
  const addTravelDestination = () => {
    if (!newTravelData.country || !newTravelData.cities || !newTravelData.startDate || !newTravelData.endDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    // 날짜 유효성 검사
    const startDateObj = new Date(newTravelData.startDate);
    const endDateObj = new Date(newTravelData.endDate);

    if (startDateObj > endDateObj) {
      setShowDateErrorModal(true);
      return;
    }

    const coordinates = countryData[newTravelData.country]?.coords;
    if (!coordinates) {
      alert('선택한 국가의 좌표를 찾을 수 없습니다.');
      return;
    }

    const cityArray = newTravelData.cities.split(',').map(city => city.trim());
    const existingData = userTravelData[newTravelData.country];
    
    const newTrip = {
      cities: cityArray,
      startDate: newTravelData.startDate,
      endDate: newTravelData.endDate
    };
    
    if (existingData) {
      // 기존 데이터가 있으면 업데이트
      const updatedTrips = [...(existingData.trips || []), newTrip];
      const allEndDates = updatedTrips.map(trip => new Date(trip.endDate));
      const latestEndDate = allEndDates.length > 0 ? new Date(Math.max(...allEndDates)).toISOString().split('T')[0] : '';


      setUserTravelData(prev => ({
        ...prev,
        [newTravelData.country]: {
          ...existingData,
          visits: existingData.visits + 1,
          lastVisit: latestEndDate, // 최신 종료일로 업데이트
          cities: [...new Set([...existingData.cities, ...cityArray])],
          coordinates,
          description: existingData.description,
          trips: updatedTrips
        }
      }));
    } else {
      // 새 데이터 추가
      setUserTravelData(prev => ({
        ...prev,
        [newTravelData.country]: {
          visits: 1,
          lastVisit: newTravelData.endDate,
          cities: cityArray,
          coordinates,
          description: '아름다운 여행지',
          trips: [newTrip]
        }
      }));
    }

    // 폼 초기화
    setNewTravelData({
      country: '',
      cities: '',
      startDate: '',
      endDate: ''
    });
    setShowAddTravel(false);
  };

  // 여행지 (도시별 여행) 삭제 함수
  const deleteCityTrip = (cityName, tripToDelete) => {
    setUserTravelData(prev => {
      const newData = { ...prev };
      const countryEnglishName = selectedCountry.country; // Use the English name key
      const countryDataForDeletion = newData[countryEnglishName];

      if (countryDataForDeletion) {
        // Filter out the exact trip object to delete
        const updatedTrips = countryDataForDeletion.trips.filter(trip =>
          !(trip.startDate === tripToDelete.startDate && 
            trip.endDate === tripToDelete.endDate && 
            JSON.stringify(trip.cities) === JSON.stringify(tripToDelete.cities))
        );

        if (updatedTrips.length === 0) {
          // 해당 국가의 모든 여행이 삭제되면 국가 자체를 삭제
          delete newData[countryEnglishName];
          setSelectedCountry(null); // 선택된 국가 초기화
          // Automatically show controls when country is deleted
          if (window.innerWidth <= 768) {
            setShowGlobeControlsOnMobile(true);
          }
        } else {
          // 도시가 포함된 다른 여행이 있는지 확인하여 도시 목록 업데이트
          const remainingCities = new Set();
          updatedTrips.forEach(trip => {
            trip.cities.forEach(city => remainingCities.add(city));
          });
          
          // 마지막 방문일 다시 계산
          const allEndDates = updatedTrips.map(trip => new Date(trip.endDate));
          const latestEndDate = allEndDates.length > 0 ? new Date(Math.max(...allEndDates)).toISOString().split('T')[0] : '';


          newData[countryEnglishName] = {
            ...countryDataForDeletion,
            visits: updatedTrips.length,
            cities: Array.from(remainingCities),
            trips: updatedTrips,
            lastVisit: latestEndDate,
          };
          // Update selectedCountry to reflect the changes immediately
          setSelectedCountry(newData[countryEnglishName]);
        }
      }
      return newData;
    });
  };

  // 지구본 텍스처 설정
  const getGlobeTextures = (mode) => {
    const textures = {
      satellite: {
        globe: '//unpkg.com/three-globe/example/img/earth-day.jpg',
        bump: '//unpkg.com/three-globe/example/img/earth-topology.png'
      },
      night: {
        globe: '//unpkg.com/three-globe/example/img/earth-night.jpg',
        bump: '//unpkg.com/three-globe/example/img/earth-topology.png'
      },
      topographic: {
        globe: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bump: '//unpkg.com/three-globe/example/img/earth-topology.png'
      }
    };
    return textures[mode] || textures.satellite;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let globeInstance = null;
    let mounted = true;

    const initGlobe = async () => {
      try {
        setIsLoading(true);
        setLoadingStatus('로딩 중...'); // Set to generic loading status

        // 컨테이너 정리
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Globe 인스턴스 생성
        globeInstance = Globe()
          .backgroundColor('#000015')
          .showAtmosphere(true)
          .atmosphereColor('#4080ff')
          .atmosphereAltitude(0.12);

        if (!mounted) return;
        
        // 텍스처 적용
        const textures = getGlobeTextures(globeMode);
        globeInstance
          .globeImageUrl(textures.globe)
          .bumpImageUrl(textures.bump);

        // 여행 포인트 설정
        const travelPoints = createTravelPoints();
        globeInstance
          .pointsData(travelPoints)
          .pointAltitude(d => d.size)
          .pointColor(d => d.color)
          .pointRadius(0.5)
          .pointResolution(12)
          .pointLabel(d => `
            <div style="
              background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.9)); 
              padding: 16px; 
              border-radius: 12px; 
              color: white; 
              max-width: 280px;
              border: 2px solid ${d.color};
              box-shadow: 0 12px 40px rgba(0,0,0,0.6);
              backdrop-filter: blur(15px);
            ">
              <h3 style="margin: 0 0 12px 0; color: ${d.color}; font-size: 18px;">
                ${d.displayCountry} ✈️
              </h3>
              <div style="margin-bottom: 8px;">
                <strong style="color: #60a5fa;">방문 횟수:</strong> 
                <span style="color: ${d.color}; font-weight: bold;">${d.visits}회</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #60a5fa;">마지막 방문:</strong> 
                <span style="color: #cbd5e1;">${d.lastVisit}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <strong style="color: #60a5fa;">방문 도시:</strong><br/>
                <span style="color: #e2e8f0;">${d.cities.join(' • ')}</span>
              </div>
              <div style="
                padding: 8px; 
                background: rgba(255,255,255,0.1); 
                border-radius: 6px;
                font-style: italic;
                color: #f1f5f9;
                font-size: 13px;
              ">
                "${d.description}"
              </div>
            </div>
          `)
          .onPointClick((point) => {
            setSelectedCountry(point);
            if (window.innerWidth <= 768) { // If mobile, hide controls when country selected
              setShowGlobeControlsOnMobile(false);
            }
            // 카메라 이동
            if (globeInstance) {
              globeInstance.pointOfView({ 
                lat: point.lat, 
                lng: point.lng, 
                altitude: 1.2 
              }, 1500);
            }
          });

        // 여행 경로 설정
        const routes = createTravelRoutes();
        globeInstance
          .arcsData(routes)
          .arcColor(d => d.color) // Use the color defined in createTravelRoutes
          .arcDashLength(1) // Make lines solid
          .arcDashGap(0) // No gaps
          .arcStroke(2) // Consistent stroke
          .arcAltitude(0.1); // Consistent altitude

        if (!mounted) return;

        // DOM에 마운트
        const globeElement = globeInstance(containerRef.current);
        
        if (mounted && containerRef.current && globeElement) {
          // 크기 설정
          globeInstance
            .width(window.innerWidth)
            .height(window.innerHeight);

          // 초기 카메라 위치
          globeInstance.pointOfView({ 
            lat: 20, 
            lng: 0, 
            altitude: 2.5 
          });

          // 컨트롤 설정
          setTimeout(() => {
            if (mounted && globeInstance.controls) {
              try {
                const controls = globeInstance.controls();
                if (controls) {
                  controls.autoRotate = true;
                  controls.autoRotateSpeed = 0.3;
                  controls.enableDamping = true;
                  controls.dampingFactor = 0.1;
                  controls.minDistance = 200;
                  controls.maxDistance = 1000;
                }
              } catch (e) {
                console.log('Error setting globe controls:', e);
              }
            }
          }, 100);

          globeRef.current = globeInstance;
          
          setLoadingStatus('로딩 중...'); // Ensure final status is generic
          
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Globe 초기화 에러:', error);
        setLoadingStatus('에러 발생: ' + error.message); // Keep error message for debugging
        
        setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
          }
        }, 2000);
      }
    };

    initGlobe();

    // 윈도우 리사이즈 처리
    const handleResize = () => {
      if (globeInstance && mounted) {
        globeInstance
          .width(window.innerWidth)
          .height(window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      
      if (globeInstance) {
        try {
          // Globe 인스턴스 정리
          if (globeInstance.renderer && globeInstance.renderer()) {
            globeInstance.renderer().dispose();
          }
        } catch (e) {
          console.log('Globe cleanup error:', e);
        }
      }
      
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [globeMode, userTravelData]); // Added userTravelData to dependency array to re-render globe with updated data

  // 컨트롤 함수들
  const goToCountry = (countryEnglishName) => {
    const countryDataFromState = userTravelData[countryEnglishName];
    if (countryDataFromState && globeRef.current) {
      globeRef.current.pointOfView({ 
        lat: countryDataFromState.coordinates[0], 
        lng: countryDataFromState.coordinates[1], 
        altitude: 1.2 
      }, 1500);
    }
  };

  const resetView = () => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ 
        lat: 20, 
        lng: 0, 
        altitude: 2.5 
      }, 1500);
    }
  };

  const toggleRotation = () => {
    if (globeRef.current && globeRef.current.controls) {
      try {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = !controls.autoRotate;
        }
      } catch (e) {
        console.log('Toggle rotation error:', e);
      }
    }
  };

  const changeGlobeMode = (mode) => {
    setGlobeMode(mode);
  };

  // 통계 계산
  const getTravelStats = () => {
    const totalCountries = Object.keys(userTravelData).length;
    const totalVisits = Object.values(userTravelData).reduce((sum, data) => sum + data.visits, 0);
    const totalCities = Object.values(userTravelData).reduce((sum, data) => sum + data.cities.length, 0);
    return { totalCountries, totalVisits, totalCities };
  };

  const stats = getTravelStats();
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 지구본 컨테이너 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 로딩 화면 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-12 rounded-3xl backdrop-blur-lg border border-white/20 text-center max-w-md">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-purple-400 border-b-purple-600 rounded-full animate-spin mx-auto opacity-50" style={{ animationDirection: 'reverse', animationDelay: '0.5s' }}></div>
            </div>
            {/* Removed "🌍 실제 지구 생성 중" and "실제 위성 이미지와 지형 데이터를 사용합니다" */}
            <div className="text-blue-300 font-medium text-lg mb-2">{loadingStatus}</div>
          </div>
        </div>
      )}

      {/* 지구본 모드 선택 및 줌 컨트롤 */}
      <div className="absolute top-6 left-6 flex gap-3 z-10">
        {/* 지구본 모드 선택 - 정사각형으로 변경 */}
        <div className={`bg-slate-900/95 backdrop-blur-lg shadow-2xl border border-white/20 ${
          isMobile 
            ? 'rounded-xl p-3 w-32 h-32' 
            : 'rounded-2xl p-4 w-40 h-40'
        }`}>
        <div className={`text-white font-medium mb-2 ${
          isMobile ? 'text-xs' : 'text-sm font-bold mb-3'
        }`}>🛰️ 지구본 모드</div>
        <div className={isMobile ? 'space-y-1' : 'space-y-1.5'}>
          <button
            onClick={() => changeGlobeMode('satellite')}
            className={`w-full font-medium transition-all ${
              isMobile 
                ? 'px-2 py-1 rounded-md text-xs' 
                : 'px-3 py-1.5 rounded-lg text-xs'
            } ${
              globeMode === 'satellite' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🛰️ 위성
          </button>
          <button
            onClick={() => changeGlobeMode('night')}
            className={`w-full font-medium transition-all ${
              isMobile 
                ? 'px-2 py-1 rounded-md text-xs' 
                : 'px-3 py-1.5 rounded-lg text-xs'
            } ${
              globeMode === 'night' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🌙 야간
          </button>
          <button
            onClick={() => changeGlobeMode('topographic')}
            className={`w-full font-medium transition-all ${
              isMobile 
                ? 'px-2 py-1 rounded-md text-xs' 
                : 'px-3 py-1.5 rounded-lg text-xs'
            } ${
              globeMode === 'topographic' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🗺️ 지형
          </button>
        </div>
        </div>
        
        {/* 줌 컨트롤 버튼 - 가로 배열로 작게 변경 및 크기 동일하게 */}
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg transition-all text-sm"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg transition-all text-sm"
          >
            -
          </button>
        </div>
      </div>

      {/* 여행 통계 패널 - 모든 버전에서 지구본 아이콘으로 토글 */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={() => setShowMobileStats(!showMobileStats)}
          className="bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-2xl p-3 border border-white/20 text-white hover:bg-slate-800/95 transition-all"
        >
          🌍
        </button>
        
        {showMobileStats && (
          <div className="absolute top-16 right-0 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 min-w-72">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">📊 여행 통계</h3>
              <button 
                onClick={() => setShowLegend(!showLegend)}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                📈
              </button>
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
              <div className="text-center p-3 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">{stats.totalCountries}</div>
                <div className="text-xs text-slate-400">방문 국가</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">{stats.totalVisits}</div>
                <div className="text-xs text-slate-400">총 여행</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-600/20 to-purple-700/20 rounded-xl border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">{stats.totalCities}</div>
                <div className="text-xs text-slate-400">방문 도시</div>
              </div>
            </div>
            
            {/* 여행지 추가 버튼 */}
            <button
              onClick={() => setShowAddTravel(true)}
              className="w-full mb-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-emerald-700 hover:to-emerald-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-sm"
            >
              ✈️ 여행지 추가
            </button>
            
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
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
                        // When selecting from stats, pass the full data object to selectedCountry
                        setSelectedCountry({
                          ...userTravelData[countryEnglishName],
                          country: countryEnglishName, // Ensure English name is preserved for internal logic
                          displayCountry: displayCountryName,
                          color: style.color // Pass color for consistent display
                        }); 
                        setShowMobileStats(false);
                        if (isMobile) { // Hide controls when country is selected from stats on mobile
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
                      {/* 방문 횟수 색깔 흰색으로 수정 */}
                      <span className="text-sm font-bold text-white mr-2">{data.visits}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 선택된 국가 정보 */}
      {selectedCountry && (
        <div className="absolute bottom-6 left-6 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 z-10 min-w-96 max-w-lg">
          <button 
            onClick={() => {
              setSelectedCountry(null);
              if (isMobile) { // If mobile, show controls again when country details are closed
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
                    // Filter trips that explicitly include this city
                    const cityTrips = (selectedCountry.trips || []).filter(trip => trip.cities.includes(city));
                    return (
                      <CityButton 
                        key={index} 
                        city={city} 
                        cityTrips={cityTrips} 
                        onDeleteCityTrip={deleteCityTrip} // Pass delete function
                      />
                    );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 컨트롤 패널 - 빠른 이동과 지구본 조작을 한 박스에 */}
      {/* 모바일에서 selectedCountry가 있을 때 숨김 처리 */}
      {(!isMobile || showGlobeControlsOnMobile) && (
        <div className="absolute bottom-6 right-6 bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 z-10">
          <div className="flex gap-6">
            {/* 빠른 이동 - 대륙별 */}
            <div>
              <div className="text-white font-medium text-sm mb-3">🚀 대륙별 이동</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { continent: 'Asia', flag: 'AS', countries: ['South Korea', 'Japan'], description: 'AS' },
                  { continent: 'Europe', flag: 'EU', countries: ['France', 'Italy', 'Germany'], description: 'EU' },
                  { continent: 'North America', flag: 'NA', countries: ['United States'], description: 'NA' },
                  { continent: 'South America', flag: 'SA', countries: [], description: 'SA' },
                  { continent: 'Africa', flag: 'AF', countries: [], description: 'AF' },
                  { continent: 'Oceania', flag: 'AU', countries: [], description: 'AU' }
                ].map(({continent, flag, countries, description}) => (
                  <button
                    key={continent}
                    onClick={() => {
                      // 해당 대륙에 방문한 국가가 있으면 첫 번째 국가로 이동
                      const visitedCountries = countries.filter(country => userTravelData[country]);
                      if (visitedCountries.length > 0) {
                        goToCountry(visitedCountries[0]);
                      } else {
                        // 방문한 국가가 없으면 대륙 중심으로 이동
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
                        setShowGlobeControlsOnMobile(false); // Hide controls after continent selection on mobile
                      }
                    }}
                    className="p-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white rounded-lg hover:from-purple-600/50 hover:to-pink-600/50 transition-all duration-300 hover:-translate-y-0.5 border border-purple-500/30 hover:border-purple-400/50 flex items-center justify-center text-sm font-bold min-h-[44px] min-w-[44px]"
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

      {/* 모바일 버전에서 컨트롤 패널 토글 버튼 제거 (사용자 요청) */}
      {/* {isMobile && !selectedCountry && (
        <button
          onClick={() => setShowGlobeControlsOnMobile(!showGlobeControlsOnMobile)}
          className="absolute bottom-6 right-6 bg-slate-900/95 backdrop-blur-lg rounded-xl shadow-2xl p-3 border border-white/20 text-white hover:bg-slate-800/95 transition-all z-20"
        >
          {showGlobeControlsOnMobile ? '메뉴 ⬅️' : '메뉴 ➡️'}
        </button>
      )} */}

      {/* 여행지 추가 모달 */}
      {showAddTravel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <h2 className="text-white font-bold text-xl mb-4">✈️ 여행지 추가</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm block mb-2">국가</label>
                <select
                  value={newTravelData.country}
                  onChange={(e) => setNewTravelData({...newTravelData, country: e.target.value})}
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">국가를 선택하세요</option>
                  {Object.entries(countryData).map(([englishName, data]) => (
                    <option key={englishName} value={englishName}>{data.koreanName} ({englishName})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-slate-300 text-sm block mb-2">방문 도시</label>
                <input
                  type="text"
                  value={newTravelData.cities}
                  onChange={(e) => setNewTravelData({...newTravelData, cities: e.target.value})}
                  placeholder="예: Seoul, Busan, Jeju"
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm block mb-2">시작일</label>
                  <input
                    type="date"
                    value={newTravelData.startDate}
                    onChange={(e) => setNewTravelData({...newTravelData, startDate: e.target.value})}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="text-slate-300 text-sm block mb-2">종료일</label>
                  <input
                    type="date"
                    value={newTravelData.endDate}
                    onChange={(e) => setNewTravelData({...newTravelData, endDate: e.target.value})}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addTravelDestination}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setShowAddTravel(false);
                  setNewTravelData({
                    country: '',
                    cities: '',
                    startDate: '',
                    endDate: ''
                  });
                }}
                className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:bg-slate-600 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 날짜 오류 모달 */}
      {showDateErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 max-w-sm w-full mx-4 text-center">
            <h3 className="text-red-400 font-bold text-xl mb-4">⚠️ 날짜 입력 오류</h3>
            <p className="text-white text-md mb-6">시작일은 종료일보다 빠르거나 같아야 합니다.</p>
            <button
              onClick={() => setShowDateErrorModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.8);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }
      `}</style>
    </div>
  );
};

export default UltraRealisticGlobe;