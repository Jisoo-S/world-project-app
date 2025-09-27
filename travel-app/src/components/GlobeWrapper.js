import React, { useEffect, useRef, useState } from 'react';

const GlobeWrapper = ({ 
  onCountryClick = () => {}, 
  onLineClick = () => {}, 
  userTravelData = {},
  homeCountry = 'South Korea',
  globeMode = 'satellite' 
}) => {
  const containerRef = useRef();
  const globeRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Globe.gl 로드 중...');
  const [error, setError] = useState(null);

  // 좌표 데이터
  const countryCoords = {
    'South Korea': [37.5665, 126.9780],
    'Japan': [36.2048, 138.2529],
    'China': [35.8617, 104.1954],
    'United States': [39.8283, -98.5795],
    'Canada': [56.1304, -106.3468],
    'Mexico': [23.6345, -102.5528],
    'Brazil': [-14.2350, -51.9253],
    'Argentina': [-38.4161, -63.6167],
    'Chile': [-35.6751, -71.5430],
    'Peru': [-9.1900, -75.0152],
    'Colombia': [4.5709, -74.2973],
    'France': [46.6034, 2.2137],
    'Germany': [51.1657, 10.4515],
    'Italy': [41.8719, 12.5674],
    'Spain': [40.4637, -3.7492],
    'United Kingdom': [55.3781, -3.4360],
    'Netherlands': [52.1326, 5.2913],
    'Belgium': [50.5039, 4.4699],
    'Switzerland': [46.8182, 8.2275],
    'Austria': [47.5162, 14.5501],
    'Norway': [60.4720, 8.4689],
    'Sweden': [60.1282, 18.6435],
    'Denmark': [56.2639, 9.5018],
    'Finland': [61.9241, 25.7482],
    'Russia': [61.5240, 105.3188],
    'Poland': [51.9194, 19.1451],
    'Czech Republic': [49.8175, 15.4730],
    'Hungary': [47.1625, 19.5033],
    'Greece': [39.0742, 21.8243],
    'Portugal': [39.3999, -8.2245],
    'Ireland': [53.4129, -8.2439],
    'India': [20.5937, 78.9629],
    'Thailand': [15.8700, 100.9925],
    'Vietnam': [14.0583, 108.2772],
    'Malaysia': [4.2105, 101.9758],
    'Singapore': [1.3521, 103.8198],
    'Indonesia': [-0.7893, 113.9213],
    'Philippines': [12.8797, 121.7740],
    'Australia': [-25.2744, 133.7751],
    'New Zealand': [-40.9006, 174.8860],
    'Egypt': [26.0975, 30.0444],
    'South Africa': [-30.5595, 22.9375],
    'Kenya': [-0.0236, 37.9062],
    'Morocco': [31.7917, -7.0926],
    'Tunisia': [33.8869, 9.5375],
    'Turkey': [38.9637, 35.2433],
    'Israel': [31.0461, 34.8516],
    'United Arab Emirates': [23.4241, 53.8478],
    'Saudi Arabia': [23.8859, 45.0792],
    'Iran': [32.4279, 53.6880],
    'Iraq': [33.2232, 43.6793],
    'Jordan': [30.5852, 36.2384],
    'Lebanon': [33.8547, 35.8623],
    'Pakistan': [30.3753, 69.3451],
    'Bangladesh': [23.6850, 90.3563],
    'Sri Lanka': [7.8731, 80.7718],
    'Nepal': [28.3949, 84.1240],
    'Myanmar': [21.9162, 95.9560],
    'Laos': [19.8563, 102.4955],
    'Cambodia': [12.5657, 104.9910],
    'Mongolia': [46.8625, 103.8467],
    'Kazakhstan': [48.0196, 66.9237],
    'Uzbekistan': [41.3775, 64.5853],
    'Armenia': [40.0691, 45.0382],
    'Georgia': [42.3154, 43.3569],
    'Azerbaijan': [40.1431, 47.5769]
  };

  // 방문 횟수별 스타일
  const getVisitStyle = (visits) => {
    const styles = {
      1: { color: '#10b981', size: 0.4 },
      2: { color: '#f59e0b', size: 0.5 },
      3: { color: '#3b82f6', size: 0.6 },
      4: { color: '#8b5cf6', size: 0.7 },
      5: { color: '#ef4444', size: 0.8 }
    };
    return styles[Math.min(visits, 5)] || styles[5];
  };

  // 텍스처 설정
  const getGlobeTextures = (mode) => {
    const textures = {
      satellite: {
        globe: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png'
      },
      night: {
        globe: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
        bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png'
      },
      day: {
        globe: 'https://unpkg.com/three-globe/example/img/earth-day.jpg',
        bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png'
      }
    };
    return textures[mode] || textures.satellite;
  };

  // 여행 포인트 생성
  const createTravelPoints = () => {
    return Object.entries(userTravelData).map(([country, data]) => {
      const coords = countryCoords[country];
      if (!coords) return null;
      
      const style = getVisitStyle(data.visits || data.trips?.length || 1);
      return {
        lat: coords[0],
        lng: coords[1],
        country,
        visits: data.visits || data.trips?.length || 1,
        lastVisit: data.lastVisit,
        cities: data.cities || [],
        size: style.size,
        color: style.color,
        trips: data.trips || []
      };
    }).filter(Boolean);
  };

  // 여행 경로 생성
  const createTravelRoutes = () => {
    const countries = Object.keys(userTravelData);
    if (countries.length < 2) return [];

    const routes = [];
    const homeCoords = countryCoords[homeCountry];
    
    if (!homeCoords) return [];

    // 홈 국가에서 각 여행지로의 경로
    countries.forEach(country => {
      if (country !== homeCountry) {
        const countryCoords_data = countryCoords[country];
        if (countryCoords_data) {
          routes.push({
            startLat: homeCoords[0],
            startLng: homeCoords[1],
            endLat: countryCoords_data[0],
            endLng: countryCoords_data[1],
            color: '#60a5fa',
            startCountry: homeCountry,
            endCountry: country
          });
        }
      }
    });

    return routes;
  };

  // Globe.gl 로드 및 초기화
  useEffect(() => {
    let mounted = true;
    let globeInstance = null;

    const waitForGlobe = () => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 100; // 10초간 시도
        
        const checkGlobe = () => {
          attempts++;
          
          console.log(`Globe 대기 시도 ${attempts}:`, {
            Globe: typeof window.Globe,
            globeReady: window.globeReady,
            THREE: typeof window.THREE
          });
          
          if (window.Globe && typeof window.Globe === 'function') {
            console.log('✅ Globe.gl 사용 가능!');
            resolve(window.Globe);
            return;
          }
          
          if (attempts >= maxAttempts) {
            reject(new Error('Globe.gl 로드 타임아웃 - CDN 연결을 확인해주세요'));
            return;
          }
          
          setTimeout(checkGlobe, 100);
        };
        
        // 즉시 체크
        checkGlobe();
      });
    };

    const initGlobe = async () => {
      try {
        setLoadingStatus('Globe.gl 대기 중...');
        
        // Globe.gl이 로드될 때까지 대기
        const Globe = await waitForGlobe();
        
        if (!mounted) return;
        
        setLoadingStatus('Globe 초기화 중...');
        
        // 컨테이너 클리어
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Globe 인스턴스 생성
        globeInstance = Globe()
          .backgroundColor('rgba(0,0,0,0)')
          .showAtmosphere(true)
          .atmosphereColor('#4080ff')
          .atmosphereAltitude(0.12);

        if (!mounted) return;

        // 텍스처 설정
        const textures = getGlobeTextures(globeMode);
        globeInstance
          .globeImageUrl(textures.globe)
          .bumpImageUrl(textures.bump);

        // 포인트 데이터 설정
        const travelPoints = createTravelPoints();
        globeInstance
          .pointsData(travelPoints)
          .pointAltitude(0.01)
          .pointColor(d => d.color)
          .pointRadius(d => d.size)
          .pointResolution(32)
          .pointLabel(d => `
            <div style="
              background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,40,0.9)); 
              padding: 16px; 
              border-radius: 12px; 
              color: white; 
              max-width: 280px;
              border: 2px solid ${d.color};
              box-shadow: 0 12px 40px rgba(0,0,0,0.6);
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
                <span style="color: #cbd5e1;">${d.lastVisit || 'N/A'}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <strong style="color: #60a5fa;">방문 도시:</strong><br/>
                <span style="color: #e2e8f0;">${d.cities.join(' • ') || 'N/A'}</span>
              </div>
            </div>
          `)
          .onPointClick((point) => {
            onCountryClick(point);
            if (globeInstance) {
              globeInstance.pointOfView({ 
                lat: point.lat, 
                lng: point.lng, 
                altitude: 1.2 
              }, 1500);
            }
          });

        // 경로 데이터 설정
        const routes = createTravelRoutes();
        globeInstance
          .arcsData(routes)
          .arcColor(d => d.color)
          .arcAltitude(0.3)
          .arcStroke(1.5)
          .onArcClick(onLineClick);

        if (!mounted) return;

        // DOM에 마운트
        setLoadingStatus('Globe 렌더링 중...');
        
        if (containerRef.current) {
          globeInstance(containerRef.current);
          
          // 크기 설정
          globeInstance
            .width(window.innerWidth)
            .height(window.innerHeight);

          // 초기 시점 설정
          const homeCoords = countryCoords[homeCountry];
          if (homeCoords) {
            globeInstance.pointOfView({ 
              lat: homeCoords[0], 
              lng: homeCoords[1], 
              altitude: 2.5 
            });
          }

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
                console.log('컨트롤 설정 에러:', e);
              }
            }
          }, 100);

          globeRef.current = globeInstance;
          window.globeRef = globeRef; // 전역 참조 추가
          
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Globe 초기화 에러:', error);
        console.log('디버깅 정보:');
        console.log('- 현재 URL:', window.location.href);
        console.log('- User Agent:', navigator.userAgent);
        console.log('- 온라인 상태:', navigator.onLine);
        console.log('- THREE.js:', typeof window.THREE);
        console.log('- Globe.gl:', typeof window.Globe);
        
        setError(`지구본 로드 실패: ${error.message}`);
        setIsLoading(false);
      }
    };

    initGlobe();

    // 리사이즈 핸들러
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
  }, []);

  // 데이터 업데이트 (재생성 없이)
  useEffect(() => {
    if (!globeRef.current) return;
    
    const globe = globeRef.current;
    
    // 포인트 데이터 업데이트
    const travelPoints = createTravelPoints();
    globe.pointsData(travelPoints);
    
    // 경로 데이터 업데이트
    const routes = createTravelRoutes();
    globe.arcsData(routes);
  }, [userTravelData, homeCountry]);

  // 모드 변경
  useEffect(() => {
    if (!globeRef.current) return;
    
    const globe = globeRef.current;
    const textures = getGlobeTextures(globeMode);
    
    globe
      .globeImageUrl(textures.globe)
      .bumpImageUrl(textures.bump);
  }, [globeMode]);

  // 외부에서 호출할 수 있는 메서드들
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.resetView = () => {
        if (globeRef.current) {
          const homeCoords = countryCoords[homeCountry];
          if (homeCoords) {
            globeRef.current.pointOfView({ 
              lat: homeCoords[0], 
              lng: homeCoords[1], 
              altitude: 2.5 
            }, 1500);
          }
        }
      };

      globeRef.current.toggleRotation = () => {
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

      globeRef.current.goToCountry = (country) => {
        const coords = countryCoords[country];
        if (coords && globeRef.current) {
          globeRef.current.pointOfView({ 
            lat: coords[0], 
            lng: coords[1], 
            altitude: 1.2 
          }, 1500);
        }
      };
    }
  }, [homeCountry, globeRef.current]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <div className="bg-red-900/80 p-8 rounded-2xl border border-red-400 text-center max-w-md mx-4">
          <div className="text-red-300 text-6xl mb-4">🌍</div>
          <div className="text-red-100 text-xl font-semibold mb-4">Globe.gl 로드 실패</div>
          <div className="text-red-200 mb-6 text-sm leading-relaxed">
            {error}
          </div>
          <div className="text-red-300 text-xs mb-6">
            • 인터넷 연결을 확인해주세요<br/>
            • 브라우저에서 JavaScript가 활성화되어 있는지 확인해주세요<br/>
            • 광고 차단기나 방화벽이 CDN을 차단하고 있지 않은지 확인해주세요
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              페이지 새로고침
            </button>
            <button 
              onClick={() => setError(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors text-sm"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Globe 컨테이너 */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* 로딩 화면 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-black/80 p-10 rounded-2xl backdrop-blur-md border border-white/10 text-center max-w-md mx-4">
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-white text-xl font-semibold mb-2">🌍 지구본 로딩 중...</p>
            <div className="text-blue-300 font-medium mb-4">{loadingStatus}</div>
            <div className="text-gray-400 text-xs">
              네트워크가 느린 경우 최대 10초가 소요될 수 있습니다
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobeWrapper;