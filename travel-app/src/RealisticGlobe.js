import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

const RealisticGlobe = () => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [userTravelData, setUserTravelData] = useState({
    '한국': { visits: 1, lastVisit: '2024.01.15', cities: ['서울', '부산'] },
    '일본': { visits: 3, lastVisit: '2023.12.20', cities: ['도쿄', '오사카', '교토'] },
    '미국': { visits: 2, lastVisit: '2023.08.10', cities: ['뉴욕', 'LA'] },
    '프랑스': { visits: 1, lastVisit: '2023.06.05', cities: ['파리'] }
  });

  // 실제 지구 지형 데이터 가져오기
  const loadRealWorldData = async () => {
    try {
      // Natural Earth 데이터를 사용한 실제 국가 경계선
      const countries = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        .then(res => res.json());
      
      return countries;
    } catch (error) {
      console.error('지형 데이터 로드 실패:', error);
      // 로컬 데이터 사용
      return null;
    }
  };

  // 사용자 여행 데이터를 지구본 포인트로 변환
  const createTravelPoints = () => {
    const countryCoordinates = {
      '한국': { lat: 37.5665, lng: 126.9780 },
      '일본': { lat: 36.2048, lng: 138.2529 },
      '미국': { lat: 39.8283, lng: -98.5795 },
      '프랑스': { lat: 46.6034, lng: 2.2137 }
    };

    return Object.entries(userTravelData).map(([country, data]) => {
      const coords = countryCoordinates[country];
      if (!coords) return null;

      return {
        lat: coords.lat,
        lng: coords.lng,
        country,
        visits: data.visits,
        lastVisit: data.lastVisit,
        cities: data.cities,
        size: Math.max(0.2, data.visits * 0.3),
        color: getVisitColor(data.visits)
      };
    }).filter(Boolean);
  };

  // 방문 횟수에 따른 색상
  const getVisitColor = (visits) => {
    const colors = {
      1: '#10b981', // 초록
      2: '#f59e0b', // 노랑
      3: '#3b82f6', // 파랑
      4: '#8b5cf6', // 보라
      5: '#ef4444'  // 빨강
    };
    return colors[Math.min(visits, 5)] || colors[5];
  };

  // 지구본 초기화
  useEffect(() => {
    if (!containerRef.current) return;

    setIsLoading(true);

    const globe = Globe()
      .height(window.innerHeight)
      .width(window.innerWidth)
      .backgroundColor('#000011')
      .showAtmosphere(true)
      .atmosphereColor('#4f9eff')
      .atmosphereAltitude(0.15)
      .enablePointerInteraction(true);

    // 실제 지구 텍스처 적용
    globe
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png');

    // 실제 국가 경계선 표시
    loadRealWorldData().then(countries => {
      if (countries) {
        globe
          .hexPolygonsData(countries.features)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.3)
          .hexPolygonUseDots(true)
          .hexPolygonColor(() => '#ffffff22')
          .hexPolygonLabel(({ properties: d }) => `
            <div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 6px; color: white; font-size: 12px;">
              <b>${d.NAME}</b>
            </div>
          `);
      }
    });

    // 여행 마커 추가
    const travelPoints = createTravelPoints();
    globe
      .pointsData(travelPoints)
      .pointAltitude('size')
      .pointColor('color')
      .pointRadius(d => d.size)
      .pointLabel(d => `
        <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; color: white; max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: ${d.color};">${d.country}</h3>
          <p style="margin: 0; font-size: 12px;">방문 횟수: ${d.visits}회</p>
          <p style="margin: 0; font-size: 12px;">마지막 방문: ${d.lastVisit}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px;">
            방문 도시: ${d.cities.join(', ')}
          </p>
        </div>
      `)
      .onPointClick((point) => {
        setSelectedCountry({
          country: point.country,
          data: userTravelData[point.country]
        });
        
        // 해당 국가로 카메라 이동
        globe.pointOfView({ 
          lat: point.lat, 
          lng: point.lng, 
          altitude: 1.5 
        }, 1000);
      });

    // 여행 경로 표시 (Arc로 연결)
    const routes = [];
    const countryCoords = {
      '한국': { lat: 37.5665, lng: 126.9780 },
      '일본': { lat: 36.2048, lng: 138.2529 },
      '미국': { lat: 39.8283, lng: -98.5795 },
      '프랑스': { lat: 46.6034, lng: 2.2137 }
    };

    // 한국을 기준으로 다른 국가들과 연결
    Object.keys(userTravelData).forEach(country => {
      if (country !== '한국') {
        routes.push({
          startLat: countryCoords['한국'].lat,
          startLng: countryCoords['한국'].lng,
          endLat: countryCoords[country].lat,
          endLng: countryCoords[country].lng,
          color: '#ffffff44'
        });
      }
    });

    globe
      .arcsData(routes)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(2)
      .arcDashAnimateTime(2000)
      .arcStroke(2);

    // 별 배경 추가
    const starField = [...Array(1000)].map(() => ({
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      size: Math.random() * 0.5
    }));

    globe
      .customLayerData(starField)
      .customThreeObject(d => {
        const obj = new globe.three.Mesh(
          new globe.three.SphereGeometry(d.size),
          new globe.three.MeshBasicMaterial({ color: '#ffffff' })
        );
        obj.position.setFromSphericalCoords(
          50,
          (90 - d.lat) * Math.PI / 180,
          (d.lng + 180) * Math.PI / 180
        );
        return obj;
      });

    // 컨테이너에 추가
    containerRef.current.appendChild(globe(containerRef.current));
    globeRef.current = globe;

    // 초기 카메라 위치 설정
    globe.pointOfView({ lat: 37.5665, lng: 126.9780, altitude: 2.5 });

    // 자동 회전 시작
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;

    setIsLoading(false);

    // 창 크기 변경 처리
    const handleResize = () => {
      globe.width(window.innerWidth).height(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && globe) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // 새 여행지 추가
  const addTravelDestination = (country, visits, lastVisit, cities) => {
    setUserTravelData(prev => ({
      ...prev,
      [country]: { visits, lastVisit, cities }
    }));

    // 지구본 업데이트
    if (globeRef.current) {
      const travelPoints = createTravelPoints();
      globeRef.current.pointsData(travelPoints);
    }
  };

  // 카메라 컨트롤
  const goToCountry = (country) => {
    const coords = {
      '한국': { lat: 37.5665, lng: 126.9780 },
      '일본': { lat: 36.2048, lng: 138.2529 },
      '미국': { lat: 39.8283, lng: -98.5795 },
      '프랑스': { lat: 46.6034, lng: 2.2137 }
    };

    if (coords[country] && globeRef.current) {
      globeRef.current.pointOfView({ 
        lat: coords[country].lat, 
        lng: coords[country].lng, 
        altitude: 1.5 
      }, 1000);
    }
  };

  const resetView = () => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 37.5665, lng: 126.9780, altitude: 2.5 }, 1000);
    }
  };

  const toggleRotation = () => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = !controls.autoRotate;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 지구본 컨테이너 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 로딩 화면 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-black/80 p-10 rounded-2xl backdrop-blur-md border border-white/10 text-center">
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-white text-xl font-semibold mb-2">실제 지구 데이터 로딩 중...</p>
            <div className="text-blue-300 font-medium">고해상도 지형과 대륙 모양을 생성하고 있습니다</div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-6 py-4 border border-white/20 z-10">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          🌍 실제 지구본 여행 아카이브
        </h1>
      </div>

      {/* 여행 통계 패널 */}
      <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-10 min-w-60">
        <h3 className="text-slate-800 font-bold text-lg mb-4">📊 여행 통계</h3>
        <div className="space-y-3">
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(userTravelData).length}</div>
            <div className="text-sm text-slate-600">방문 국가</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(userTravelData).reduce((sum, data) => sum + data.visits, 0)}
            </div>
            <div className="text-sm text-slate-600">총 여행 횟수</div>
          </div>
          {Object.entries(userTravelData).map(([country, data]) => (
            <div 
              key={country}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => goToCountry(country)}
            >
              <span className="font-medium text-slate-700">{country}</span>
              <div className="flex items-center space-x-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getVisitColor(data.visits) }}
                ></span>
                <span className="text-sm text-slate-600">{data.visits}회</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 국가 정보 패널 */}
      {selectedCountry && (
        <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-10 min-w-80 max-w-md">
          <button 
            onClick={() => setSelectedCountry(null)}
            className="absolute top-3 right-4 text-slate-400 hover:text-red-500 text-2xl transition-colors"
          >
            ×
          </button>
          <h3 className="text-slate-800 font-bold text-xl mb-4 border-b-2 border-blue-500 pb-2">
            🌍 {selectedCountry.country}
          </h3>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border-l-4 border-blue-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600">방문 횟수</div>
                  <div className="text-xl font-bold text-blue-600">{selectedCountry.data.visits}회</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">마지막 방문</div>
                  <div className="text-lg font-semibold text-slate-800">{selectedCountry.data.lastVisit}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-slate-600 mb-2">방문 도시</div>
                <div className="flex flex-wrap gap-2">
                  {selectedCountry.data.cities.map((city, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 컨트롤 패널 */}
      <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-10">
        <div className="text-slate-800 font-bold text-base mb-3">🎮 지구본 조작</div>
        <div className="space-y-2">
          <button 
            onClick={resetView}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            🏠 홈으로
          </button>
          <button 
            onClick={toggleRotation}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-700 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            🔄 회전 토글
          </button>
        </div>
      </div>

      {/* 퀵 네비게이션 */}
      <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-10">
        <div className="text-slate-800 font-bold text-base mb-3">🚀 빠른 이동</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(userTravelData).map(country => (
            <button
              key={country}
              onClick={() => goToCountry(country)}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="absolute top-80 right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/20 z-10 max-w-48">
        <div className="text-slate-800 font-bold text-sm mb-3">📈 방문 횟수 범례</div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(visits => (
            <div key={visits} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getVisitColor(visits) }}
              ></div>
              <span>{visits}{visits === 5 ? '+' : ''}회 방문</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealisticGlobe;