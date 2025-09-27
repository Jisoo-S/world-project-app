import React, { useEffect, useRef, useState } from 'react';

const SimpleGlobe = ({ 
  onCountryClick = () => {}, 
  userTravelData = {},
  homeCountry = 'South Korea' 
}) => {
  const containerRef = useRef();
  const globeRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let checkCount = 0;
    const maxChecks = 50;

    const initGlobe = () => {
      checkCount++;
      
      console.log(`Globe 체크 ${checkCount}/50:`, {
        Globe: typeof window.Globe,
        mounted,
        containerExists: !!containerRef.current
      });

      if (!window.Globe || typeof window.Globe !== 'function') {
        if (checkCount < maxChecks) {
          setTimeout(initGlobe, 200);
          return;
        } else {
          if (mounted) {
            setError('Globe.gl 라이브러리를 로드할 수 없습니다. 네트워크 연결을 확인해주세요.');
            setIsLoading(false);
          }
          return;
        }
      }

      if (!mounted || !containerRef.current) return;

      try {
        console.log('✅ Globe.gl 초기화 시작');
        
        // 컨테이너 클리어
        containerRef.current.innerHTML = '';

        // Globe 생성
        const globe = window.Globe()
          .backgroundColor('rgba(0,0,0,0)')
          .showAtmosphere(true)
          .atmosphereColor('#4080ff')
          .atmosphereAltitude(0.1)
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png');

        // 여행 포인트 생성
        const points = Object.entries(userTravelData).map(([country, data]) => {
          // 간단한 좌표 매핑
          const coords = {
            'South Korea': [37.5665, 126.9780],
            'Japan': [36.2048, 138.2529],
            'United States': [39.8283, -98.5795],
            'France': [46.6034, 2.2137],
            'Germany': [51.1657, 10.4515],
            'Italy': [41.8719, 12.5674],
            'Spain': [40.4637, -3.7492],
            'United Kingdom': [55.3781, -3.4360],
            'China': [35.8617, 104.1954],
            'Thailand': [15.8700, 100.9925],
            'Australia': [-25.2744, 133.7751]
          }[country];

          if (!coords) return null;

          const visits = data.visits || data.trips?.length || 1;
          const colors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];
          
          return {
            lat: coords[0],
            lng: coords[1],
            country,
            visits,
            size: 0.3 + (visits * 0.1),
            color: colors[Math.min(visits - 1, 4)]
          };
        }).filter(Boolean);

        globe
          .pointsData(points)
          .pointAltitude(0.01)
          .pointRadius(d => d.size)
          .pointColor(d => d.color)
          .pointLabel(d => `
            <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 6px; color: white;">
              <strong>${d.country}</strong><br/>
              방문 횟수: ${d.visits}회
            </div>
          `)
          .onPointClick(point => {
            onCountryClick(point);
            globe.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1000);
          });

        // DOM에 마운트
        if (mounted && containerRef.current) {
          globe(containerRef.current);
          globe
            .width(window.innerWidth)
            .height(window.innerHeight);

          // 초기 시점
          globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

          // 자동 회전
          setTimeout(() => {
            try {
              const controls = globe.controls();
              if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
              }
            } catch (e) {
              console.log('컨트롤 설정 실패:', e);
            }
          }, 500);

          globeRef.current = globe;
          window.globeRef = { current: globe }; // 전역 참조 추가
          
          // 밖에서 호출할 수 있는 메서드들 추가
          globe.resetView = () => {
            if (globe) {
              globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
            }
          };
          
          globe.toggleRotation = () => {
            try {
              const controls = globe.controls();
              if (controls) {
                controls.autoRotate = !controls.autoRotate;
              }
            } catch (e) {
              console.log('회전 제어 실패:', e);
            }
          };
          
          globe.goToCountry = (country) => {
            const coords = {
              'South Korea': [37.5665, 126.9780],
              'Japan': [36.2048, 138.2529],
              'United States': [39.8283, -98.5795],
              'France': [46.6034, 2.2137],
              'Germany': [51.1657, 10.4515],
              'Italy': [41.8719, 12.5674],
              'Spain': [40.4637, -3.7492],
              'United Kingdom': [55.3781, -3.4360],
              'China': [35.8617, 104.1954],
              'Thailand': [15.8700, 100.9925],
              'Australia': [-25.2744, 133.7751]
            }[country];
            
            if (coords && globe) {
              globe.pointOfView({ lat: coords[0], lng: coords[1], altitude: 1.5 }, 1000);
            }
          };
          console.log('✅ Globe 초기화 완료');
          
          setTimeout(() => {
            if (mounted) {
              setIsLoading(false);
            }
          }, 1000);
        }

      } catch (error) {
        console.error('Globe 초기화 에러:', error);
        if (mounted) {
          setError('지구본 초기화 중 오류가 발생했습니다: ' + error.message);
          setIsLoading(false);
        }
      }
    };

    // 초기화 시작
    setTimeout(initGlobe, 100);

    const handleResize = () => {
      if (globeRef.current && mounted) {
        try {
          globeRef.current
            .width(window.innerWidth)
            .height(window.innerHeight);
        } catch (e) {
          console.log('리사이즈 에러:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [userTravelData]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
        <div className="bg-red-900/80 p-6 rounded-xl border border-red-400 text-center max-w-sm mx-4">
          <div className="text-red-200 text-4xl mb-4">🌍</div>
          <div className="text-red-100 font-semibold mb-2">지구본 로드 실패</div>
          <div className="text-red-200 text-sm mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-black/80 p-8 rounded-xl border border-white/10 text-center">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">🌍 지구본 로딩 중...</p>
            <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleGlobe;