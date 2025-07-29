import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

const UltraRealisticGlobe = () => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('초기화 중...');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [globeMode, setGlobeMode] = useState('satellite');
  
  const [userTravelData, setUserTravelData] = useState({
    'South Korea': { 
      visits: 1, 
      lastVisit: '2024.01.15', 
      cities: ['Seoul', 'Busan', 'Jeju'],
      coordinates: [37.5665, 126.9780],
      description: '고향, 아름다운 한반도'
    },
    'Japan': { 
      visits: 3, 
      lastVisit: '2023.12.20', 
      cities: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'],
      coordinates: [36.2048, 138.2529],
      description: '벚꽃과 전통이 어우러진 나라'
    },
    'United States': { 
      visits: 2, 
      lastVisit: '2023.08.10', 
      cities: ['New York', 'Los Angeles', 'San Francisco'],
      coordinates: [39.8283, -98.5795],
      description: '자유의 나라, 광활한 대륙'
    },
    'France': { 
      visits: 1, 
      lastVisit: '2023.06.05', 
      cities: ['Paris', 'Nice', 'Lyon'],
      coordinates: [46.6034, 2.2137],
      description: '로맨스와 예술의 도시'
    },
    'Italy': { 
      visits: 2, 
      lastVisit: '2023.09.15', 
      cities: ['Rome', 'Florence', 'Venice'],
      coordinates: [41.8719, 12.5674],
      description: '고대 로마의 영광과 르네상스 예술'
    },
    'Germany': { 
      visits: 1, 
      lastVisit: '2023.07.22', 
      cities: ['Berlin', 'Munich', 'Hamburg'],
      coordinates: [51.1657, 10.4515],
      description: '엔지니어링과 맥주의 나라'
    }
  });

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
    return Object.entries(userTravelData).map(([country, data]) => {
      const style = getVisitStyle(data.visits);
      return {
        lat: data.coordinates[0],
        lng: data.coordinates[1],
        country,
        visits: data.visits,
        lastVisit: data.lastVisit,
        cities: data.cities,
        description: data.description,
        size: style.size,
        color: style.color,
        glowColor: style.glow
      };
    });
  };

  // 여행 경로 생성
  const createTravelRoutes = () => {
    const koreaCoords = userTravelData['South Korea'].coordinates;
    const routes = [];

    Object.entries(userTravelData).forEach(([country, data]) => {
      if (country !== 'South Korea') {
        routes.push({
          startLat: koreaCoords[0],
          startLng: koreaCoords[1],
          endLat: data.coordinates[0],
          endLng: data.coordinates[1],
          color: '#ffffff66',
          country: country,
          visits: data.visits
        });
      }
    });

    return routes;
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

  // 국가 데이터 로드 (간단한 로컬 데이터 사용)
  const getCountriesData = () => {
    // 간단한 국가 데이터 - 실제 API 호출 대신 사용
    return Promise.resolve({
      type: 'FeatureCollection',
      features: [
        // 간단한 예시 데이터
        {
          type: 'Feature',
          properties: { NAME: 'South Korea' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[126, 38], [129, 38], [129, 35], [126, 35], [126, 38]]]
          }
        }
      ]
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let globeInstance = null;
    let mounted = true;

    const initGlobe = async () => {
      try {
        setIsLoading(true);
        setLoadingStatus('3D 엔진 초기화 중...');

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

        setLoadingStatus('지구 텍스처 로딩 중...');
        
        // 텍스처 적용
        const textures = getGlobeTextures(globeMode);
        globeInstance
          .globeImageUrl(textures.globe)
          .bumpImageUrl(textures.bump);

        setLoadingStatus('여행 마커 생성 중...');

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
                ${d.country} ✈️
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
            
            // 카메라 이동
            if (globeInstance) {
              globeInstance.pointOfView({ 
                lat: point.lat, 
                lng: point.lng, 
                altitude: 1.2 
              }, 1500);
            }
          });

        setLoadingStatus('여행 경로 연결 중...');

        // 여행 경로 설정
        const routes = createTravelRoutes();
        globeInstance
          .arcsData(routes)
          .arcColor(d => `rgba(96, 165, 250, ${0.3 + (d.visits * 0.1)})`)
          .arcDashLength(0.6)
          .arcDashGap(2)
          .arcDashAnimateTime(3000)
          .arcStroke(2)
          .arcAltitude(0.1);

        if (!mounted) return;

        setLoadingStatus('마운팅 중...');

        // DOM에 마운트
        const globeElement = globeInstance(containerRef.current);
        
        if (mounted && containerRef.current && globeElement) {
          // 크기 설정
          globeInstance
            .width(window.innerWidth)
            .height(window.innerHeight);

          // 초기 카메라 위치
          globeInstance.pointOfView({ 
            lat: 37.5665, 
            lng: 126.9780, 
            altitude: 2.5 
          });

          // 컨트롤 설정
          setTimeout(() => {
            if (mounted && globeInstance.controls) {
              const controls = globeInstance.controls();
              if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.3;
                controls.enableDamping = true;
                controls.dampingFactor = 0.1;
                controls.minDistance = 200;
                controls.maxDistance = 1000;
              }
            }
          }, 100);

          globeRef.current = globeInstance;
          
          setLoadingStatus('🌍 실제 지구본 완성!');
          
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Globe 초기화 에러:', error);
        setLoadingStatus('에러 발생: ' + error.message);
        
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
  }, [globeMode]);

  // 컨트롤 함수들
  const goToCountry = (countryName) => {
    const countryData = userTravelData[countryName];
    if (countryData && globeRef.current) {
      globeRef.current.pointOfView({ 
        lat: countryData.coordinates[0], 
        lng: countryData.coordinates[1], 
        altitude: 1.2 
      }, 1500);
    }
  };

  const resetView = () => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ 
        lat: 37.5665, 
        lng: 126.9780, 
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
            <h2 className="text-white text-2xl font-bold mb-4">🌍 실제 지구 생성 중</h2>
            <div className="text-blue-300 font-medium text-lg mb-2">{loadingStatus}</div>
            <div className="text-slate-400 text-sm">실제 위성 이미지와 지형 데이터를 사용합니다</div>
          </div>
        </div>
      )}

      {/* 헤더 제거 */}

      {/* 지구본 모드 선택 - 정사각형으로 변경 */}
      <div className={`absolute top-6 left-6 bg-slate-900/95 backdrop-blur-lg shadow-2xl border border-white/20 z-10 ${
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
            
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {Object.entries(userTravelData).map(([country, data]) => {
                const style = getVisitStyle(data.visits);
                return (
                  <div 
                    key={country}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all cursor-pointer border border-slate-700/50 hover:border-slate-600"
                    onClick={() => {
                      goToCountry(country);
                      setShowMobileStats(false);
                    }}
                  >
                    <div>
                      <div className="font-medium text-white text-sm">{country}</div>
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
                      <span className="text-sm font-bold text-white">{data.visits}</span>
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
            onClick={() => setSelectedCountry(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-400 text-2xl transition-colors"
          >
            ×
          </button>
          <h3 className="text-white font-bold text-xl mb-4 border-b border-slate-700 pb-2">
            🌍 {selectedCountry.country}
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
              <div className="text-slate-400 text-sm mb-2">방문 도시</div>
              <div className="flex flex-wrap gap-2">
                {selectedCountry.cities.map((city, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white rounded-full text-sm font-medium border border-blue-500/30"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-sm mb-2">여행 소감</div>
              <p className="text-slate-200 italic text-sm leading-relaxed">
                "{selectedCountry.description}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 컨트롤 패널 - 빠른 이동과 지구본 조작을 한 박스에 */}
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