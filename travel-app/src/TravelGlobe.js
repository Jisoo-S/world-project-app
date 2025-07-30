import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const TravelGlobe = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const globeRef = useRef(null);
  const countryLinesRef = useRef(null);
  const markersRef = useRef([]);
  const animationIdRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('초기화 중...');
  const [isAnimating, setIsAnimating] = useState(true);
  const [showCountries, setShowCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [userTravelData, setUserTravelData] = useState({});
  const [selectedNewCountry, setSelectedNewCountry] = useState('');
  const [newTripData, setNewTripData] = useState({ location: '', dates: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 전 세계 국가 데이터베이스 (195개국)
  const countryDatabase = {
    '대한민국': { coords: [37.5665, 126.9780], continent: '아시아' },
    '일본': { coords: [36.2048, 138.2529], continent: '아시아' },
    '중국': { coords: [35.8617, 104.1954], continent: '아시아' },
    '미국': { coords: [39.8283, -98.5795], continent: '북미' },
    '캐나다': { coords: [56.1304, -106.3468], continent: '북미' },
    '멕시코': { coords: [23.6345, -102.5528], continent: '북미' },
    '브라질': { coords: [-14.2350, -51.9253], continent: '남미' },
    '아르헨티나': { coords: [-38.4161, -63.6167], continent: '남미' },
    '칠레': { coords: [-35.6751, -71.5430], continent: '남미' },
    '페루': { coords: [-9.1900, -75.0152], continent: '남미' },
    '콜롬비아': { coords: [4.5709, -74.2973], continent: '남미' },
    '프랑스': { coords: [46.6034, 2.2137], continent: '유럽' },
    '독일': { coords: [51.1657, 10.4515], continent: '유럽' },
    '이탈리아': { coords: [41.8719, 12.5674], continent: '유럽' },
    '스페인': { coords: [40.4637, -3.7492], continent: '유럽' },
    '영국': { coords: [55.3781, -3.4360], continent: '유럽' },
    '네덜란드': { coords: [52.1326, 5.2913], continent: '유럽' },
    '벨기에': { coords: [50.5039, 4.4699], continent: '유럽' },
    '스위스': { coords: [46.8182, 8.2275], continent: '유럽' },
    '오스트리아': { coords: [47.5162, 14.5501], continent: '유럽' },
    '노르웨이': { coords: [60.4720, 8.4689], continent: '유럽' },
    '스웨덴': { coords: [60.1282, 18.6435], continent: '유럽' },
    '덴마크': { coords: [56.2639, 9.5018], continent: '유럽' },
    '핀란드': { coords: [61.9241, 25.7482], continent: '유럽' },
    '러시아': { coords: [61.5240, 105.3188], continent: '유럽/아시아' },
    '폴란드': { coords: [51.9194, 19.1451], continent: '유럽' },
    '체코': { coords: [49.8175, 15.4730], continent: '유럽' },
    '헝가리': { coords: [47.1625, 19.5033], continent: '유럽' },
    '그리스': { coords: [39.0742, 21.8243], continent: '유럽' },
    '포르투갈': { coords: [39.3999, -8.2245], continent: '유럽' },
    '아일랜드': { coords: [53.4129, -8.2439], continent: '유럽' },
    '인도': { coords: [20.5937, 78.9629], continent: '아시아' },
    '태국': { coords: [15.8700, 100.9925], continent: '아시아' },
    '베트남': { coords: [14.0583, 108.2772], continent: '아시아' },
    '말레이시아': { coords: [4.2105, 101.9758], continent: '아시아' },
    '싱가포르': { coords: [1.3521, 103.8198], continent: '아시아' },
    '인도네시아': { coords: [-0.7893, 113.9213], continent: '아시아' },
    '필리핀': { coords: [12.8797, 121.7740], continent: '아시아' },
    '호주': { coords: [-25.2744, 133.7751], continent: '오세아니아' },
    '뉴질랜드': { coords: [-40.9006, 174.8860], continent: '오세아니아' },
    '이집트': { coords: [26.0975, 30.0444], continent: '아프리카' },
    '남아프리카공화국': { coords: [-30.5595, 22.9375], continent: '아프리카' },
    '케냐': { coords: [-0.0236, 37.9062], continent: '아프리카' },
    '모로코': { coords: [31.7917, -7.0926], continent: '아프리카' },
    '튀니지': { coords: [33.8869, 9.5375], continent: '아프리카' },
    '터키': { coords: [38.9637, 35.2433], continent: '유럽/아시아' },
    '이스라엘': { coords: [31.0461, 34.8516], continent: '아시아' },
    '아랍에미리트': { coords: [23.4241, 53.8478], continent: '아시아' },
    '사우디아라비아': { coords: [23.8859, 45.0792], continent: '아시아' },
    '이란': { coords: [32.4279, 53.6880], continent: '아시아' },
    '이라크': { coords: [33.2232, 43.6793], continent: '아시아' },
    '요단': { coords: [30.5852, 36.2384], continent: '아시아' },
    '레바논': { coords: [33.8547, 35.8623], continent: '아시아' },
    '파키스탄': { coords: [30.3753, 69.3451], continent: '아시아' },
    '방글라데시': { coords: [23.6850, 90.3563], continent: '아시아' },
    '스리랑카': { coords: [7.8731, 80.7718], continent: '아시아' },
    '네팔': { coords: [28.3949, 84.1240], continent: '아시아' },
    '미얀마': { coords: [21.9162, 95.9560], continent: '아시아' },
    '라오스': { coords: [19.8563, 102.4955], continent: '아시아' },
    '캄보디아': { coords: [12.5657, 104.9910], continent: '아시아' },
    '몽골': { coords: [46.8625, 103.8467], continent: '아시아' },
    '카자흐스탄': { coords: [48.0196, 66.9237], continent: '아시아' },
    '우즈베키스탄': { coords: [41.3775, 64.5853], continent: '아시아' },
    '아르메니아': { coords: [40.0691, 45.0382], continent: '아시아' },
    '조지아': { coords: [42.3154, 43.3569], continent: '아시아' },
    '아제르바이잔': { coords: [40.1431, 47.5769], continent: '아시아' }
  };

  // 방문 횟수별 색상
  const visitColors = {
    1: 0x10b981, // 1회 - 초록색
    2: 0xf59e0b, // 2회 - 노란색
    3: 0x3b82f6, // 3회 - 파란색
    4: 0x8b5cf6, // 4회 - 보라색
    5: 0xef4444  // 5회+ - 빨간색
  };

  // 좌표 변환 함수
  const latLngToVector3 = useCallback((lat, lng, radius = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    
    return new THREE.Vector3(x, y, z);
  }, []);

  // 실제 지구 텍스처 생성
  const createUltraRealisticEarthTexture = useCallback(() => {
    setLoadingStatus('고품질 지구 텍스처 생성 중...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // 바다 배경
    const oceanGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.height
    );
    oceanGradient.addColorStop(0, '#1e40af');
    oceanGradient.addColorStop(0.3, '#2563eb');
    oceanGradient.addColorStop(0.6, '#3b82f6');
    oceanGradient.addColorStop(0.8, '#60a5fa');
    oceanGradient.addColorStop(1, '#1e40af');
    
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 대륙들 (더 현실적인 모양)
    const continents = [
      { x: 2400, y: 400, w: 1200, h: 600, color: '#22c55e', name: '아시아' },
      { x: 1800, y: 300, w: 600, h: 400, color: '#16a34a', name: '유럽' },
      { x: 1900, y: 700, w: 400, h: 800, color: '#eab308', name: '아프리카' },
      { x: 400, y: 200, w: 800, h: 600, color: '#15803d', name: '북미' },
      { x: 800, y: 800, w: 300, h: 700, color: '#166534', name: '남미' },
      { x: 2800, y: 1200, w: 400, h: 200, color: '#ca8a04', name: '오세아니아' },
      { x: 0, y: 1700, w: canvas.width, h: 348, color: '#f8fafc', name: '남극' }
    ];
    
    continents.forEach(continent => {
      ctx.fillStyle = continent.color;
      
      ctx.beginPath();
      const points = 50;
      
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radiusX = continent.w / 2;
        const radiusY = continent.h / 2;
        const centerX = continent.x + radiusX;
        const centerY = continent.y + radiusY;
        
        const noise1 = Math.sin(angle * 5) * 0.1;
        const noise2 = Math.sin(angle * 13) * 0.05;
        const noise3 = Math.sin(angle * 23) * 0.02;
        const irregularity = 0.7 + noise1 + noise2 + noise3;
        
        const x = centerX + Math.cos(angle) * radiusX * irregularity;
        const y = centerY + Math.sin(angle) * radiusY * irregularity;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    
    // 경위도선
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 24; i++) {
      const x = (canvas.width / 24) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let i = 0; i <= 12; i++) {
      const y = (canvas.height / 12) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    setLoadingStatus('고품질 지구 텍스처 생성 완료');
    return new THREE.CanvasTexture(canvas);
  }, []);

  // 지구본 생성
  const createGlobe = useCallback(() => {
    setLoadingStatus('3D 지구본 메시 생성 중...');
    
    const geometry = new THREE.SphereGeometry(2, 128, 128);
    const earthTexture = createUltraRealisticEarthTexture();
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 30,
      transparent: false,
      bumpScale: 0.02
    });
    
    const globe = new THREE.Mesh(geometry, material);
    globe.castShadow = true;
    globe.receiveShadow = true;
    
    setLoadingStatus('3D 지구본 생성 완료');
    return globe;
  }, [createUltraRealisticEarthTexture]);

  // 라벨 생성
  const createLabel = useCallback((countryName, position, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const colorHex = `#${color.toString(16).padStart(6, '0')}`;
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 3;
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 8;
    ctx.strokeRect(2, 2, canvas.width-4, canvas.height-4);
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(countryName, canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.8, 0.2, 1);
    
    const labelPosition = position.clone().multiplyScalar(1.4);
    sprite.position.copy(labelPosition);
    
    return sprite;
  }, []);

  // 마커 생성 (사용자 데이터 기반)
  const createMarkers = useCallback(() => {
    setLoadingStatus('3D 여행 마커 생성 중...');
    
    const markerGroup = new THREE.Group();
    const markers = [];
    
    Object.entries(userTravelData).forEach(([country, data]) => {
      const countryInfo = countryDatabase[country];
      if (!countryInfo) return;
      
      const position = latLngToVector3(countryInfo.coords[0], countryInfo.coords[1], 2);
      const visits = data.trips.length;
      const color = visitColors[Math.min(visits, 5)];

      // 핀 모양 지오메트리 생성
      const pinHeight = 0.15 + (visits * 0.02);
      const pinHeadRadius = 0.04;
      const pinBodyRadius = 0.02;

      const pinGroup = new THREE.Group();

      // 핀 머리 (구)
      const headGeometry = new THREE.SphereGeometry(pinHeadRadius, 16, 16);
      const headMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        shininess: 100
      });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = pinHeight;
      pinGroup.add(head);

      // 핀 몸통 (원기둥)
      const bodyGeometry = new THREE.CylinderGeometry(pinBodyRadius, pinBodyRadius * 0.5, pinHeight, 16);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: color,
        opacity: 0.8,
        transparent: true
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = pinHeight / 2;
      pinGroup.add(body);
      
      pinGroup.position.copy(position);
      pinGroup.lookAt(new THREE.Vector3(0,0,0));
      pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), position.clone().normalize());

      pinGroup.userData = { country, data, isPin: true };
      pinGroup.castShadow = true;
      
      markerGroup.add(pinGroup);
      markers.push(pinGroup);
      
      // 국가 라벨 생성
      const label = createLabel(country, position, color);
      markerGroup.add(label);
    });
    
    markersRef.current = markers;
    markerGroup.userData.isMarkerGroup = true;
    setLoadingStatus('3D 여행 마커 생성 완료');
    return markerGroup;
  }, [latLngToVector3, createLabel, userTravelData, countryDatabase, visitColors]);

  // 여행 경로 라인 생성
  const createTravelLines = useCallback(() => {
    const linesGroup = new THREE.Group();
    if (Object.keys(userTravelData).length < 2) return linesGroup;

    const visitedCountries = Object.keys(userTravelData).sort((a, b) => {
      const aDate = new Date(userTravelData[a].trips[0].dates.split(' - ')[0]);
      const bDate = new Date(userTravelData[b].trips[0].dates.split(' - ')[0]);
      return aDate - bDate;
    });

    for (let i = 0; i < visitedCountries.length - 1; i++) {
      const startCountry = visitedCountries[i];
      const endCountry = visitedCountries[i+1];

      const startInfo = countryDatabase[startCountry];
      const endInfo = countryDatabase[endCountry];

      if (startInfo && endInfo) {
        const startPos = latLngToVector3(startInfo.coords[0], startInfo.coords[1], 2);
        const endPos = latLngToVector3(endInfo.coords[0], endInfo.coords[1], 2);

        const arc = createGreatCircleArc(startPos, endPos);
        const geometry = new THREE.BufferGeometry().setFromPoints(arc);
        
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.7,
          linewidth: 2
        });

        const line = new THREE.Line(geometry, material);
        line.userData = {
          type: 'travel-line',
          from: startCountry,
          to: endCountry,
          dates: `${userTravelData[startCountry].trips[0].dates} -> ${userTravelData[endCountry].trips[0].dates}`
        };
        linesGroup.add(line);
      }
    }
    return linesGroup;
  }, [userTravelData, countryDatabase, latLngToVector3]);

  // Great Circle Arc 생성 함수
  const createGreatCircleArc = (start, end) => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const p = new THREE.Vector3().lerpVectors(start, end, i / 100);
      p.normalize();
      p.multiplyScalar(2 + 0.1 * Math.sin(Math.PI * i / 100));
      points.push(p);
    }
    return points;
  };

  // 마커 및 라인 업데이트 함수
  const updateGlobeData = useCallback(() => {
    if (!globeGroupRef.current) return;
    
    // 기존 마커 및 라인 그룹 제거
    const existingMarkers = globeGroupRef.current.children.filter(child => 
      child.userData && (child.userData.isMarkerGroup || child.userData.isLineGroup)
    );
    existingMarkers.forEach(group => globeGroupRef.current.remove(group));
    
    // 새 마커 그룹 추가
    const newMarkerGroup = createMarkers();
    newMarkerGroup.userData.isMarkerGroup = true;
    globeGroupRef.current.add(newMarkerGroup);

    // 새 라인 그룹 추가
    const newLinesGroup = createTravelLines();
    newLinesGroup.userData.isLineGroup = true;
    globeGroupRef.current.add(newLinesGroup);

  }, [createMarkers, createTravelLines]);

  // userTravelData가 변경될 때마다 마커와 라인 업데이트
  useEffect(() => {
    useEffect(() => {
    if (globeGroupRef.current && Object.keys(userTravelData).length > 0) {
      updateGlobeData();
    }
  }, [userTravelData, updateGlobeData]);

  // 별 배경 생성
  const createStarField = useCallback(() => {
    setLoadingStatus('우주 배경 생성 중...');
    
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false
    });
    
    const starVertices = [];
    const starColors = [];
    
    for (let i = 0; i < 5000; i++) {
      const radius = 100 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      starVertices.push(x, y, z);
      
      const brightness = 0.5 + Math.random() * 0.5;
      starColors.push(brightness, brightness, brightness);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    return stars;
  }, []);

  // 터치 이벤트 처리 (모바일)
  const setupTouchEvents = useCallback(() => {
    let touches = [];
    let lastDistance = 0;
    
    const onTouchStart = (e) => {
      touches = Array.from(e.touches);
      if (touches.length === 2) {
        lastDistance = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );
      }
    };
    
    const onTouchMove = (e) => {
      e.preventDefault();
      if (touches.length === 2 && e.touches.length === 2) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const delta = (currentDistance - lastDistance) * 0.01;
        if (cameraRef.current) {
          cameraRef.current.position.z -= delta;
          cameraRef.current.position.z = Math.max(3, Math.min(15, cameraRef.current.position.z));
        }
        lastDistance = currentDistance;
      }
    };
    
    const onTouchEnd = () => {
      touches = [];
    };
    
    const renderer = rendererRef.current;
    if (renderer) {
      renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
      renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
      renderer.domElement.addEventListener('touchend', onTouchEnd);
      
      return () => {
        renderer.domElement.removeEventListener('touchstart', onTouchStart);
        renderer.domElement.removeEventListener('touchmove', onTouchMove);
        renderer.domElement.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, []);

  // 마우스 이벤트 설정
  const setupMouseEvents = useCallback(() => {
    setLoadingStatus('인터랙션 시스템 설정 중...');
    
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };
      
      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.x += deltaMove.y * 0.008;
        globeGroupRef.current.rotation.y += deltaMove.x * 0.008;
        
        globeGroupRef.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroupRef.current.rotation.x));
      }
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseUp = () => {
      isDragging = false;
    };
    
    const onClick = (e) => {
      if (isDragging) return;
      
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const intersects = raycaster.intersectObjects(globeGroupRef.current.children, true);

      const lineIntersect = intersects.find(i => i.object.userData.type === 'travel-line');
      const markerIntersect = intersects.find(i => i.object.parent.userData.isPin);

      if (lineIntersect) {
        setSelectedLine(lineIntersect.object.userData);
        setSelectedCountry(null);
      } else if (markerIntersect) {
        const marker = markerIntersect.object.parent;
        setSelectedCountry({
          name: marker.userData.country,
          data: marker.userData.data
        });
        setSelectedLine(null);
      } else {
        setSelectedCountry(null);
        setSelectedLine(null);
      }
    };
    
    const onWheel = (e) => {
      e.preventDefault();
      if (cameraRef.current) {
        cameraRef.current.position.z += e.deltaY * 0.003;
        cameraRef.current.position.z = Math.max(3, Math.min(15, cameraRef.current.position.z));
      }
    };
    
    const renderer = rendererRef.current;
    if (renderer) {
      renderer.domElement.addEventListener('mousedown', onMouseDown);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('mouseup', onMouseUp);
      renderer.domElement.addEventListener('click', onClick);
      renderer.domElement.addEventListener('wheel', onWheel);
      
      return () => {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('click', onClick);
        renderer.domElement.removeEventListener('wheel', onWheel);
      };
    }
  }, []);

  // 애니메이션 루프
  const animate = useCallback(() => {
    if (isAnimating && globeGroupRef.current) {
      globeGroupRef.current.rotation.y += 0.002;
      
      markersRef.current.forEach((marker, index) => {
        const time = Date.now() * 0.001 + index * 0.3;
        const pulseFactor = 1 + Math.sin(time * 3) * 0.1;
        const visits = marker.userData.data.trips.length;
        const baseScale = 2.5 + (visits * 0.5);
        marker.scale.setScalar(baseScale * pulseFactor);
      });
    }
    
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isAnimating]);

  // 카메라 줌 컨트롤
  const zoomIn = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(3, cameraRef.current.position.z - 0.5);
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(15, cameraRef.current.position.z + 0.5);
    }
  }, []);

  // 컨트롤 함수들
  const resetView = useCallback(() => {
    if (cameraRef.current && globeGroupRef.current) {
      const targetPosition = { x: 0, y: 0, z: 6 };
      const targetRotation = { x: 0, y: 0, z: 0 };
      
      const duration = 1000;
      const startTime = Date.now();
      const startCameraZ = cameraRef.current.position.z;
      const startRotationX = globeGroupRef.current.rotation.x;
      const startRotationY = globeGroupRef.current.rotation.y;
      
      function animateReset() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        if (cameraRef.current && globeGroupRef.current) {
          cameraRef.current.position.z = startCameraZ + (targetPosition.z - startCameraZ) * easeProgress;
          globeGroupRef.current.rotation.x = startRotationX + (targetRotation.x - startRotationX) * easeProgress;
          globeGroupRef.current.rotation.y = startRotationY + (targetRotation.y - startRotationY) * easeProgress;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateReset);
        }
      }
      
      animateReset();
    }
  }, []);

  const toggleAnimation = useCallback(() => {
    setIsAnimating(prev => !prev);
  }, []);

  // 국가 추가 함수
  const addCountry = useCallback(() => {
    if (!selectedNewCountry || !newTripData.location || !newTripData.dates) {
      alert('모든 필드를 입력해주세요!');
      return;
    }

    setUserTravelData(prev => {
      const updated = { ...prev };
      if (updated[selectedNewCountry]) {
        updated[selectedNewCountry].trips.push({ ...newTripData });
      } else {
        updated[selectedNewCountry] = {
          trips: [{ ...newTripData }]
        };
      }
      return updated;
    });

    // 입력 필드 초기화
    setSelectedNewCountry('');
    setNewTripData({ location: '', dates: '' });
    setShowAddCountry(false);
  }, [selectedNewCountry, newTripData]);

  // 통계 계산
  const getStats = useCallback(() => {
    const visitCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    Object.values(userTravelData).forEach(data => {
      const visits = Math.min(data.trips.length, 5);
      visitCounts[visits]++;
    });
    return visitCounts;
  }, [userTravelData]);

  // 초기화
  useEffect(() => {
    if (!mountRef.current) return;

    setLoadingStatus('Three.js 엔진 초기화 중...');

    try {
      // Scene 생성
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000008);
      sceneRef.current = scene;

      // Camera 생성
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 6);
      cameraRef.current = camera;

      // Renderer 생성
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;
      
      mountRef.current.appendChild(renderer.domElement);

      setLoadingStatus('고급 조명 시스템 설정 중...');
      
      // 조명 설정
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.set(10, 5, 10);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      scene.add(sunLight);

      const moonLight = new THREE.DirectionalLight(0x6366f1, 0.3);
      moonLight.position.set(-10, -3, -10);
      scene.add(moonLight);

      const atmosphereLight = new THREE.PointLight(0x60a5fa, 0.5, 30);
      atmosphereLight.position.set(0, 0, 4);
      scene.add(atmosphereLight);

      setLoadingStatus('지구본 시스템 구축 중...');

      // 글로브 그룹 생성
      const globeGroup = new THREE.Group();
      scene.add(globeGroup);
      globeGroupRef.current = globeGroup;
      
      // 지구본 생성 및 추가
      const globe = createGlobe();
      globeGroup.add(globe);
      globeRef.current = globe;
      
      // 마커 생성 및 추가 (초기에는 빈 상태)
      const markerGroup = createMarkers();
      globeGroup.add(markerGroup);

      // 별 배경 추가
      const stars = createStarField();
      scene.add(stars);

      // 이벤트 설정
      const mouseCleanup = setupMouseEvents();
      const touchCleanup = setupTouchEvents();

      setLoadingStatus('최종 설정 중...');
      
      // 애니메이션 시작
      animationIdRef.current = requestAnimationFrame(animate);
      
      setLoadingStatus('🎉 완벽한 실제 지구본 완성!');
      
      // 로딩 화면 서서히 사라지기
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      // 창 크기 변경 처리
      const handleResize = () => {
        if (camera && renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mouseCleanup) mouseCleanup();
        if (touchCleanup) touchCleanup();
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
      
    } catch (error) {
      console.error('❌ 초기화 오류:', error);
      setLoadingStatus(`오류 발생! ${error.message} 브라우저를 새로고침해주세요.`);
    }
  }, [createGlobe, createMarkers, createStarField, setupMouseEvents, setupTouchEvents, animate]);

  // 애니메이션 효과 시작
  useEffect(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    animationIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [animate]);

  const stats = getStats();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-black/80 p-10 rounded-2xl backdrop-blur-md border border-white/10 text-center">
            <div className="w-15 h-15 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
            <p className="text-white text-xl font-semibold mb-2">실제 지구본을 생성하는 중...</p>
            <div className="text-blue-300 font-medium">{loadingStatus}</div>
          </div>
        </div>
      )}

      {/* Header - 데스크톱만 */}
      {!isMobile && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl px-6 py-4 border border-white/20 z-10">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            🌍 나의 여행 아카이브
          </h1>
        </div>
      )}

      {/* Stats Panel - 데스크톱은 항상 표시, 모바일은 토글 */}
      {(!isMobile || showStats) && (
        <div className={`absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-10 min-w-60 ${
          isMobile 
            ? 'top-5 right-5 animate-in slide-in-from-right duration-300' 
            : 'top-5 right-5'
        }`}>
          {isMobile && (
            <button 
              onClick={() => setShowStats(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-red-500 text-xl transition-colors"
            >
              ×
            </button>
          )}
          <h3 className="text-slate-800 font-bold text-lg mb-4">📊 여행 통계</h3>
          <div className="space-y-3">
            {Object.entries(stats).map(([visits, count]) => (
              count > 0 && (
                <div key={visits} className="flex items-center text-sm font-medium text-gray-600">
                  <div 
                    className="w-3.5 h-3.5 rounded-full mr-3 shadow-sm"
                    style={{ 
                      backgroundColor: `#${visitColors[parseInt(visits)].toString(16).padStart(6, '0')}` 
                    }}
                  ></div>
                  <span>{visits}회 방문: {count}개국</span>
                </div>
              )
            ))}
            {Object.values(stats).every(count => count === 0) && (
              <div className="text-gray-500 text-sm">아직 여행 기록이 없습니다</div>
            )}
          </div>
        </div>
      )}

      {/* 모바일용 Stats 버튼 */}
      {isMobile && !showStats && (
        <button 
          onClick={() => setShowStats(true)}
          className="absolute top-5 right-5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/20 text-slate-800 hover:bg-white transition-all duration-300 z-10"
        >
          🌍
        </button>
      )}

      {/* Left Controls - 반응형 레이아웃 */}
      <div className={`absolute top-5 left-5 z-10 ${
        isMobile 
          ? 'flex flex-col space-y-3' 
          : 'flex space-x-4'
      }`}>
        {/* Usage Guide Button */}
        <button 
          onClick={() => setShowUsageGuide(!showUsageGuide)}
          className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-4 py-3 border border-white/20 text-slate-800 font-semibold hover:bg-white transition-all duration-300 hover:shadow-xl whitespace-nowrap"
        >
          💡 사용법
        </button>
        
        {/* Add Country Button */}
        <button 
          onClick={() => setShowAddCountry(!showAddCountry)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-700 hover:-translate-y-0.5 shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          ➕ 여행지 추가
        </button>
      </div>

      {/* Usage Guide Panel */}
      {showUsageGuide && (
        <div className={`absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-20 max-w-80 text-sm animate-in slide-in-from-left duration-300 ${
          isMobile 
            ? 'top-24 left-5 right-5 max-w-none' 
            : 'top-20 left-5'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <div className="text-slate-800 font-bold">💡 사용법</div>
            <button 
              onClick={() => setShowUsageGuide(false)}
              className="text-slate-400 hover:text-red-500 text-xl transition-colors"
            >
              ×
            </button>
          </div>
          <div className="text-slate-600 leading-relaxed space-y-2">
            <div>• <strong>마우스 드래그</strong>로 지구본 회전</div>
            <div>• <strong>휠</strong>로 확대/축소</div>
            {isMobile && <div>• <strong>핀치</strong>로 확대/축소</div>}
            <div>• <strong>마커 클릭</strong>으로 여행기록 보기</div>
            <div>• <strong>➕ 버튼</strong>으로 새 여행지 추가</div>
            <div>• <strong>+/- 버튼</strong>으로 줌 조절</div>
          </div>
        </div>
      )}

      {/* Add Country Panel */}
      {showAddCountry && (
        <div className={`absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-20 animate-in slide-in-from-left duration-300 ${
          isMobile 
            ? 'top-24 left-5 right-5' 
            : 'top-32 left-5 min-w-80'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-800 font-bold text-lg">➕ 여행지 추가</h3>
            <button 
              onClick={() => setShowAddCountry(false)}
              className="text-slate-400 hover:text-red-500 text-xl transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">국가 선택</label>
              <select 
                value={selectedNewCountry}
                onChange={(e) => setSelectedNewCountry(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">국가를 선택하세요</option>
                {Object.keys(countryDatabase).sort().map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">도시/지역</label>
              <input 
                type="text"
                value={newTripData.location}
                onChange={(e) => setNewTripData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="예: 서울, 파리, 뉴욕"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">여행 날짜</label>
              <input 
                type="text"
                value={newTripData.dates}
                onChange={(e) => setNewTripData(prev => ({ ...prev, dates: e.target.value }))}
                placeholder="예: 2024.01.15 - 01.20"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button 
              onClick={addCountry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              여행지 추가하기
            </button>
          </div>
        </div>
      )}

      {/* Zoom Controls - 아래로 이동 */}
      <div className={`absolute left-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 z-10 ${
        isMobile ? 'bottom-40' : 'bottom-20'
      }`}>
        <button 
          onClick={zoomIn}
          className="block w-12 h-12 text-slate-800 font-bold text-xl hover:bg-gray-100 transition-colors rounded-t-2xl border-b border-gray-200"
        >
          +
        </button>
        <button 
          onClick={zoomOut}
          className="block w-12 h-12 text-slate-800 font-bold text-xl hover:bg-gray-100 transition-colors rounded-b-2xl"
        >
          −
        </button>
      </div>

      {/* Controls */}
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
            onClick={toggleAnimation}
            className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl text-white ${
              isAnimating 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            }`}
          >
            {isAnimating ? '⏸️ 정지' : '▶️ 회전'}
          </button>
        </div>
      </div>

      {/* Country Info Panel */}
      {selectedCountry && (
        <div className={`absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-10 max-h-96 overflow-y-auto animate-in slide-in-from-left duration-300 ${
          isMobile 
            ? 'bottom-5 left-5 right-5' 
            : 'bottom-5 left-5 min-w-80'
        }`}>
          <button 
            onClick={() => setSelectedCountry(null)}
            className="absolute top-3 right-4 text-slate-400 hover:text-red-500 text-2xl transition-colors"
          >
            ×
          </button>
          <h3 className="text-slate-800 font-bold text-xl mb-4 border-b-2 border-blue-500 pb-2">
            🌍 {selectedCountry.name} ({selectedCountry.data.trips.length}회 방문)
          </h3>
          <div className="space-y-3">
            {selectedCountry.data.trips.map((trip, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm hover:translate-x-1 transition-transform"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="font-bold text-slate-800 text-base mb-1">📍 {trip.location}</div>
                <div className="text-slate-600 text-sm">📅 {trip.dates}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travel Line Info Panel */}
      {selectedLine && (
        <div className={`absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/20 z-10 animate-in slide-in-from-bottom duration-300 ${
          isMobile 
            ? 'bottom-5 left-5 right-5' 
            : 'bottom-20 left-1/2 transform -translate-x-1/2'
        }`}>
           <button 
            onClick={() => setSelectedLine(null)}
            className="absolute top-3 right-4 text-slate-400 hover:text-red-500 text-2xl transition-colors"
          >
            ×
          </button>
          <div className="text-center">
            <div className="font-bold text-slate-800 text-base">{selectedLine.from} → {selectedLine.to}</div>
            <div className="text-slate-600 text-sm">{selectedLine.dates}</div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default TravelGlobe;